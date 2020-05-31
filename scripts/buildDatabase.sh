#!/bin/bash

set -euo pipefail

# Force default language for output sorting to be bytewise. Necessary to ensure uniformity amongst
# UNIX commands.
export LC_ALL=C

# By default, the latest Wikipedia dump will be downloaded. If a download date in the format
# YYYYMMDD is provided as the first argument, it will be used instead.
if [[ $# -eq 0 ]]; then
  DOWNLOAD_DATE=$(wget -q -O- https://dumps.wikimedia.your.org/enwiki/ | grep -Po '\d{8}' | sort | tail -n1)
else
  if [ ${#1} -ne 8 ]; then
    echo "[ERROR] Invalid download date provided: $1"
    exit 1
  else
    DOWNLOAD_DATE=$1
  fi
fi

ROOT_DIR=`pwd`
OUT_DIR="dump"

DOWNLOAD_URL="https://dumps.wikimedia.your.org/enwiki/$DOWNLOAD_DATE"
TORRENT_URL="https://tools.wmflabs.org/dump-torrents/enwiki/$DOWNLOAD_DATE"

SHA1SUM_FILENAME="enwiki-$DOWNLOAD_DATE-sha1sums.txt"
REDIRECTS_FILENAME="enwiki-$DOWNLOAD_DATE-redirect.sql.gz"
PAGES_FILENAME="enwiki-$DOWNLOAD_DATE-page.sql.gz"
LINKS_FILENAME="enwiki-$DOWNLOAD_DATE-pagelinks.sql.gz"


# Make the output directory if it doesn't already exist and move to it
mkdir -p $OUT_DIR
pushd $OUT_DIR > /dev/null


echo "[INFO] Download date: $DOWNLOAD_DATE"
echo "[INFO] Download URL: $DOWNLOAD_URL"
echo "[INFO] Output directory: $OUT_DIR"
echo

##############################
#  DOWNLOAD WIKIPEDIA DUMPS  #
##############################

function download_file() {
  if [ ! -f $2 ]; then
    echo
    if [ $1 != sha1sums ] && command -v aria2c > /dev/null; then
      echo "[INFO] Downloading $1 file via torrent"
      time aria2c --summary-interval=0 --console-log-level=warn --seed-time=0 \
        "$TORRENT_URL/$2.torrent"
    else
      echo "[INFO] Downloading $1 file via wget"
      time wget --progress=dot:giga "$DOWNLOAD_URL/$2"
    fi

    if [ $1 != sha1sums ]; then
      echo
      echo "[INFO] Verifying SHA-1 hash for $1 file"
      time grep "$2" "$SHA1SUM_FILENAME" | sha1sum -c
      if [ $? -ne 0 ]; then
        echo
        echo "[ERROR] Downloaded $1 file has incorrect SHA-1 hash"
        rm $2
        exit 1
      fi
    fi
  else
    echo "[WARN] Already downloaded $1 file"
  fi
}

download_file "sha1sums" $SHA1SUM_FILENAME
download_file "redirects" $REDIRECTS_FILENAME
download_file "pages" $PAGES_FILENAME
download_file "links" $LINKS_FILENAME

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
    | pigz --fast > redirects.txt.gz.tmp
  mv redirects.txt.gz.tmp redirects.txt.gz
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
  # Splice out the page title and whether or not the page is a redirect
  # Zip into output file
  time pigz -dc $PAGES_FILENAME \
    | sed -n 's/^INSERT INTO `page` VALUES (//p' \
    | sed -e 's/),(/\'$'\n/g' \
    | egrep "^[0-9]+,0," \
    | sed -e $"s/,0,'/\t/" \
    | sed -e $"s/',[^,]*,\([01]\).*/\t\1/" \
    | pigz --fast > pages.txt.gz.tmp
  mv pages.txt.gz.tmp pages.txt.gz
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
    | pigz --fast > links.txt.gz.tmp
  mv links.txt.gz.tmp links.txt.gz
else
  echo "[WARN] Already trimmed links file"
fi


###########################################
#  REPLACE TITLES AND REDIRECTS IN FILES  #
###########################################
if [ ! -f redirects.with_ids.txt.gz ]; then
  echo
  echo "[INFO] Replacing titles in redirects file"
  time python "$ROOT_DIR/replace_titles_in_redirects_file.py" pages.txt.gz redirects.txt.gz \
    | sort -S 100% -t $'\t' -k 1n,1n \
    | pigz --fast > redirects.with_ids.txt.gz.tmp
  mv redirects.with_ids.txt.gz.tmp redirects.with_ids.txt.gz
else
  echo "[WARN] Already replaced titles in redirects file"
fi

if [ ! -f links.with_ids.txt.gz ]; then
  echo
  echo "[INFO] Replacing titles and redirects in links file"
  time python "$ROOT_DIR/replace_titles_and_redirects_in_links_file.py" pages.txt.gz redirects.with_ids.txt.gz links.txt.gz \
    | pigz --fast > links.with_ids.txt.gz.tmp
  mv links.with_ids.txt.gz.tmp links.with_ids.txt.gz
else
  echo "[WARN] Already replaced titles and redirects in links file"
fi

if [ ! -f pages.pruned.txt.gz ]; then
  echo
  echo "[INFO] Pruning pages which are marked as redirects but with no redirect"
  time python "$ROOT_DIR/prune_pages_file.py" pages.txt.gz redirects.with_ids.txt.gz \
    | pigz --fast > pages.pruned.txt.gz
else
  echo "[WARN] Already pruned pages which are marked as redirects but with no redirect"
fi

#####################
#  SORT LINKS FILE  #
#####################
if [ ! -f links.sorted_by_source_id.txt.gz ]; then
  echo
  echo "[INFO] Sorting links file by source page ID"
  time pigz -dc links.with_ids.txt.gz \
    | sort -S 80% -t $'\t' -k 1n,1n \
    | uniq \
    | pigz --fast > links.sorted_by_source_id.txt.gz.tmp
  mv links.sorted_by_source_id.txt.gz.tmp links.sorted_by_source_id.txt.gz
else
  echo "[WARN] Already sorted links file by source page ID"
fi

if [ ! -f links.sorted_by_target_id.txt.gz ]; then
  echo
  echo "[INFO] Sorting links file by target page ID"
  time pigz -dc links.with_ids.txt.gz \
    | sort -S 80% -t $'\t' -k 2n,2n \
    | uniq \
    | pigz --fast > links.sorted_by_target_id.txt.gz.tmp
  mv links.sorted_by_target_id.txt.gz.tmp links.sorted_by_target_id.txt.gz
else
  echo "[WARN] Already sorted links file by target page ID"
fi


#############################
#  GROUP SORTED LINKS FILE  #
#############################
if [ ! -f links.grouped_by_source_id.txt.gz ]; then
  echo
  echo "[INFO] Grouping source links file by source page ID"
  time pigz -dc links.sorted_by_source_id.txt.gz \
   | awk -F '\t' '$1==last {printf "|%s",$2; next} NR>1 {print "";} {last=$1; printf "%s\t%s",$1,$2;} END{print "";}' \
   | pigz --fast > links.grouped_by_source_id.txt.gz.tmp
  mv links.grouped_by_source_id.txt.gz.tmp links.grouped_by_source_id.txt.gz
else
  echo "[WARN] Already grouped source links file by source page ID"
fi

if [ ! -f links.grouped_by_target_id.txt.gz ]; then
  echo
  echo "[INFO] Grouping target links file by target page ID"
  time pigz -dc links.sorted_by_target_id.txt.gz \
    | awk -F '\t' '$2==last {printf "|%s",$1; next} NR>1 {print "";} {last=$2; printf "%s\t%s",$2,$1;} END{print "";}' \
    | gzip > links.grouped_by_target_id.txt.gz
else
  echo "[WARN] Already grouped target links file by target page ID"
fi


################################
# COMBINE GROUPED LINKS FILES  #
################################
if [ ! -f links.with_counts.txt.gz ]; then
  echo
  echo "[INFO] Combining grouped links files"
  time python "$ROOT_DIR/combine_grouped_links_files.py" links.grouped_by_source_id.txt.gz links.grouped_by_target_id.txt.gz \
    | pigz --fast > links.with_counts.txt.gz.tmp
  mv links.with_counts.txt.gz.tmp links.with_counts.txt.gz
else
  echo "[WARN] Already combined grouped links files"
fi


############################
#  CREATE SQLITE DATABASE  #
############################
if [ ! -f sdow.sqlite ]; then
  echo
  echo "[INFO] Creating redirects table"
  time pigz -dc redirects.with_ids.txt.gz | sqlite3 sdow.sqlite ".read $ROOT_DIR/../sql/createRedirectsTable.sql"

  echo
  echo "[INFO] Creating pages table"
  time pigz -dc pages.pruned.txt.gz | sqlite3 sdow.sqlite ".read $ROOT_DIR/../sql/createPagesTable.sql"

  echo
  echo "[INFO] Creating links table"
  time pigz -dc links.with_counts.txt.gz | sqlite3 sdow.sqlite ".read $ROOT_DIR/../sql/createLinksTable.sql"

  echo
  echo "[INFO] Compressing SQLite file"
  time pigz --best --keep sdow.sqlite
else
  echo "[WARN] Already created SQLite database"
fi


echo
echo "[INFO] All done!"
