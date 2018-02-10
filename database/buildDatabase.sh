#!/bin/bash

set -euo pipefail

# Force default language for output sorting to be bytewise.
export LC_ALL=C

# By default, the latest Wikipedia dump will be downloaded. If a download date in the format
# YYYYMMDD is provided as the first argument, it will be used instead.
if [ ${#1} -ne 8 ]; then
  DOWNLOAD_DATE="latest"
else
  DOWNLOAD_DATE=$1
fi

ROOT_DIR=`pwd`
OUT_DIR="dump"

DOWNLOAD_URL="https://dumps.wikimedia.your.org/enwiki/$DOWNLOAD_DATE"

MD5SUM_FILENAME="enwiki-$DOWNLOAD_DATE-md5sums.txt"
REDIRECTS_FILENAME="enwiki-$DOWNLOAD_DATE-redirect.sql.gz"
PAGES_FILENAME="enwiki-$DOWNLOAD_DATE-page.sql.gz"
LINKS_FILENAME="enwiki-$DOWNLOAD_DATE-pagelinks.sql.gz"


# Make the output directory if it doesn't already exist and move to it
mkdir -p $OUT_DIR
pushd $OUT_DIR


echo "[INFO] Download URL: $DOWNLOAD_URL"
echo "[INFO] Output directory: $OUT_DIR"


##############################
#  DOWNLOAD WIKIPEDIA DUMPS  #
##############################
if [ ! -f $MD5SUM_FILENAME ]; then
  echo "[INFO] Downloading md5sums file"
  time wget -nv "$DOWNLOAD_URL/$MD5SUM_FILENAME"
else
  echo "[WARN] Already downloaded md5sums file"
fi

if [ ! -f $REDIRECTS_FILENAME ]; then
  echo
  echo "[INFO] Downloading redirects file"
  time wget -nv "$DOWNLOAD_URL/$REDIRECTS_FILENAME"

  echo "[INFO] Verifying md5sum for redirects file"
  time md5sum $REDIRECTS_FILENAME | sed "s/\s.*$//" | grep --quiet --file - $MD5SUM_FILENAME
  if [ $? -ne 0 ]; then
    echo "[ERROR] Downloaded redirects file has incorrect md5sum"
    exit 1
  fi
else
  echo "[WARN] Already downloaded redirects file"
fi

if [ ! -f $PAGES_FILENAME ]; then
  echo
  echo "[INFO] Downloading pages file"
  time wget -nv "$DOWNLOAD_URL/$PAGES_FILENAME"

  echo "[INFO] Verifying md5sum for pages file"
  time md5sum $PAGES_FILENAME | sed "s/\s.*$//" | grep --quiet --file - $MD5SUM_FILENAME
  if [ $? -ne 0 ]; then
    echo "[ERROR] Downloaded pages file has incorrect md5sum"
    exit 1
  fi
else
  echo "[WARN] Already downloaded pages file"
fi

if [ ! -f $LINKS_FILENAME ]; then
  echo
  echo "[INFO] Downloading links file"
  time wget -nv "$DOWNLOAD_URL/$LINKS_FILENAME"

  echo "[INFO] Verifying md5sum for links file"
  time md5sum $LINKS_FILENAME | sed "s/\s.*$//" | grep --quiet --file - $MD5SUM_FILENAME
  if [ $? -ne 0 ]; then
    echo "[ERROR] Downloaded links file has incorrect md5sum"
    exit 1
  fi
else
  echo "[WARN] Already downloaded links file"
fi


##########################
#  TRIM WIKIPEDIA DUMPS  #
##########################
if [ ! -f redirects.txt.gz ]; then
  echo
  echo "[INFO] Trimming redirects file"

  # Unzip
  # Remove all lines that don't start with INSERT INTO...
  # Split into individual records
  # Only keep records in namespace 0
  # Replace namespace with a tab
  # Remove everything starting at the to page name's closing apostrophe
  # Zip into output file
  time pigz -dc $REDIRECTS_FILENAME \
    | sed -n 's/^INSERT INTO `redirect` VALUES (//p' \
    | sed -e 's/),(/\'$'\n/g' \
    | egrep "^[0-9]+,0," \
    | sed -e $"s/,0,'/\t/g" \
    | sed -e "s/','.*//g" \
    | pigz -1 > redirects.txt.gz
else
  echo "[WARN] Already trimmed redirects file"
fi

if [ ! -f pages.txt.gz ]; then
  echo
  echo "[INFO] Trimming pages file"

  # Unzip
  # Remove all lines that don't start with INSERT INTO...
  # Split into individual records
  # Only keep records in namespace 0
  # Replace namespace with a tab
  # Remove everything starting at the page name's closing apostrophe
  # Zip into output file
  time pigz -dc $PAGES_FILENAME \
    | sed -n 's/^INSERT INTO `page` VALUES (//p' \
    | sed -e 's/),(/\'$'\n/g' \
    | egrep "^[0-9]+,0," \
    | sed -e $"s/,0,'/\t/g" \
    | sed -e "s/','.*//g" \
    | pigz -1 > pages.txt.gz
else
  echo "[WARN] Already trimmed pages file"
fi

if [ ! -f links.txt.gz ]; then
  echo
  echo "[INFO] Trimming links file"

  # Unzip
  # Remove all lines that don't start with INSERT INTO...
  # Split into individual records
  # Only keep records in namespace 0
  # Replace namespace with a tab
  # Remove everything starting at the to page name's closing apostrophe
  # Zip into output file
  time pigz -dc $LINKS_FILENAME \
    | sed -n 's/^INSERT INTO `pagelinks` VALUES (//p' \
    | sed -e 's/),(/\'$'\n/g' \
    | egrep "^[0-9]+,0,.*,0$" \
    | sed -e $"s/,0,'/\t/g" \
    | sed -e "s/',0//g" \
    | pigz -1 > links.txt.gz
else
  echo "[WARN] Already trimmed links file"
fi


###########################################
#  REPLACE TITLES AND REDIRECTS IN FILES  #
###########################################
if [ ! -f redirects.with_ids.txt.gz ]; then
  echo
  echo "[INFO] Replacing titles in redirects file"
  time python "$ROOT_DIR/replaceTitlesInRedirectsFile.py" pages.txt.gz redirects.txt.gz \
    | pigz -1 > redirects.with_ids.txt.gz
else
  echo "[WARN] Already replaced titles in redirects file"
fi

if [ ! -f links.with_ids.txt.gz ]; then
  echo
  echo "[INFO] Replacing titles and redirects in links file"
  time python "$ROOT_DIR/replaceTitlesAndRedirectsInLinksFile.py" pages.txt.gz redirects.with_ids.txt.gz links.txt.gz \
    | pigz -1 > links.with_ids.txt.gz
else
  echo "[WARN] Already replaced titles and redirects in links file"
fi

#####################
#  SORT LINKS FILE  #
#####################
if [ ! -f links.sorted_by_from_id.txt.gz ]; then
  echo
  echo "[INFO] Sorting links file by from page ID"
  time pigz -dc links.with_ids.txt.gz \
    | sort -S 100% -t $'\t' -k 1n,1n \
    | uniq \
    | pigz -1 > links.sorted_by_from_id.txt.gz
else
  echo "[WARN] Already sorted links file by from page ID"
fi

if [ ! -f links.sorted_by_to_id.txt.gz ]; then
  echo
  echo "[INFO] Sorting links file by to page ID"
  time pigz -dc links.with_ids.txt.gz \
    | sort -S 100% -t $'\t' -k 2n,2n \
    | uniq \
    | pigz -1 > links.sorted_by_to_id.txt.gz
else
  echo "[WARN] Already sorted links file by to page ID"
fi


#############################
#  GROUP SORTED LINKS FILE  #
#############################
if [ ! -f links.grouped_by_from_id.txt.gz ]; then
  echo
  echo "[INFO] Grouping from links file by from page ID"
  time pigz -dc links.sorted_by_from_id.txt.gz \
   | awk -F '\t' '$1==last {printf "|%s",$2; next} NR>1 {print "";} {last=$1; printf "%s\t%s",$1,$2;} END{print "";}' \
   | pigz -1 > links.grouped_by_from_id.txt.gz
else
  echo "[WARN] Already grouped from links file by from page ID"
fi

if [ ! -f links.grouped_by_to_id.txt.gz ]; then
  echo
  echo "[INFO] Grouping to links file by to page ID"
  time pigz -dc links.sorted_by_to_id.txt.gz \
    | awk -F '\t' '$2==last {printf "|%s",$1; next} NR>1 {print "";} {last=$2; printf "%s\t%s",$2,$1;} END{print "";}' \
    | gzip > links.grouped_by_to_id.txt.gz
else
  echo "[WARN] Already grouped to links file by to page ID"
fi


##################################
# GENERATE COMPOSITE LINKS FILE  #
##################################
if [ ! -f links.with_counts.txt.gz ]; then
  echo
  echo "[INFO] Adding link counts to pages file"
  time python "$ROOT_DIR/generateCompositeLinksFile.py" pages.txt.gz redirects.with_ids.txt.gz links.grouped_by_from_id.txt.gz links.grouped_by_to_id.txt.gz \
    | pigz -1 > links.with_counts.txt.gz
else
  echo "[WARN] Already generated pages file with link counts"
fi


############################
#  CREATE SQLITE DATABASE  #
############################
if [ ! -f sdow.sqlite ]; then
  echo "[INFO] Creating redirects table"
  time pigz -dc redirects.with_ids.txt.gz | sqlite3 sdow.sqlite ".read $ROOT_DIR/createRedirectsTable.sql"

  echo
  echo "[INFO] Creating pages table"
  time pigz -dc pages.txt.gz | sqlite3 sdow.sqlite ".read $ROOT_DIR/createPagesTable.sql"

  echo
  echo "[INFO] Creating links table"
  time pigz -dc links.with_counts.txt.gz | sqlite3 sdow.sqlite ".read $ROOT_DIR/createLinksTable.sql"
else
  echo "[WARN] Already created SQLite database"
fi


echo
echo "[INFO] All done!"
