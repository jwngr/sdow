#!/bin/bash

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
echo
echo "[INFO] Downloading files"

if [ ! -f $MD5SUM_FILENAME ]; then
  echo "[INFO] Downloading md5sums file"
  wget "$DOWNLOAD_URL/$MD5SUM_FILENAME"
else
  echo "[WARN] Already downloaded md5sums file"
fi

if [ ! -f $REDIRECTS_FILENAME ]; then
  echo "[INFO] Downloading redirects file"
  wget "$DOWNLOAD_URL/$REDIRECTS_FILENAME"

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
  echo "[INFO] Downloading pages file"
  wget "$DOWNLOAD_URL/$PAGES_FILENAME"

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
  echo "[INFO] Downloading links file"
  wget "$DOWNLOAD_URL/$LINKS_FILENAME"

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
echo
echo "[INFO] Trimming files"

if [ ! -f redirects.txt.gz ]; then
  echo "[INFO] Trimming the redirects file"

  # Print progress bar
  # Unzip
  # Remove all lines that don't start with INSERT INTO...
  # Split into individual records
  # Only keep records in namespace 0
  # Replace namespace with a tab
  # Remove everything starting at the to page name's closing apostrophe
  # Zip into output file
  pv $REDIRECTS_FILENAME \
    | gunzip \
    | LC_ALL=C sed -n 's/^INSERT INTO `redirect` VALUES (//p' \
    | LC_ALL=C sed -e 's/),(/\'$'\n/g' \
    | LC_ALL=C egrep "^[0-9]+,0," \
    | LC_ALL=C sed -e $"s/,0,'/\t/g" \
    | LC_ALL=C sed -e "s/','.*//g" \
    | gzip > redirects.txt.gz
else
  echo "[WARN] Already created trimmed redirects file"
fi

if [ ! -f pages.txt.gz ]; then
  echo "[INFO] Trimming the pages file"

  # Print progress bar
  # Unzip
  # Remove all lines that don't start with INSERT INTO...
  # Split into individual records
  # Only keep records in namespace 0
  # Replace namespace with a tab
  # Remove everything starting at the page name's closing apostrophe
  # Zip into output file
  pv $PAGES_FILENAME \
    | gunzip \
    | LC_ALL=C sed -n 's/^INSERT INTO `page` VALUES (//p' \
    | LC_ALL=C sed -e 's/),(/\'$'\n/g' \
    | LC_ALL=C egrep "^[0-9]+,0," \
    | LC_ALL=C sed -e $"s/,0,'/\t/g" \
    | LC_ALL=C sed -e "s/','.*//g" \
    | gzip > pages.txt.gz
else
  echo "[WARN] Already created trimmed pages file"
fi

if [ ! -f links.txt.gz ]; then
  echo "[INFO] Trimming the links file"

  # Print progress bar
  # Unzip
  # Remove all lines that don't start with INSERT INTO...
  # Split into individual records
  # Only keep records in namespace 0
  # Replace namespace with a tab
  # Remove everything starting at the to page name's closing apostrophe
  # Zip into output file
  pv $LINKS_FILENAME \
    | gunzip \
    | LC_ALL=C sed -n 's/^INSERT INTO `pagelinks` VALUES (//p' \
    | LC_ALL=C sed -e 's/),(/\'$'\n/g' \
    | LC_ALL=C egrep "^[0-9]+,0,.*,0$" \
    | LC_ALL=C sed -e $"s/,0,'/\t/g" \
    | LC_ALL=C sed -e "s/',0//g" \
    | gzip > links.txt.gz
else
  echo "[WARN] Already created trimmed links file"
fi


######################################################
#  REPLACE PAGE NAMES WITH IDS AND REMOVE REDIRECTS  #
######################################################
echo
echo "[INFO] Replacing page names with IDs and removing redirects"

if [ ! -f redirects.with_ids.txt.gz ]; then
  echo "[INFO] Replacing page names with IDs in redirects file"
  time python "$ROOT_DIR/replacePageNamesWithIdsInRedirectsFile.py" pages.txt.gz redirects.txt.gz \
    | gzip > redirects.with_ids.txt.gz
else
  echo "[WARN] Already replaced page names with IDs in redirects file"
fi

if [ ! -f links.with_ids.txt.gz ]; then
  echo "[INFO] Replacing page names with IDs and removing redirects in links file"
  time python "$ROOT_DIR/replacePageNamesWithIdsAndRemoveRedirectsInLinksFile.py" pages.txt.gz redirects.with_ids.txt.gz links.txt.gz \
    | gzip > links.with_ids.txt.gz
else
  echo "[WARN] Already replaced page names with IDs and removed redirects in links file"
fi


############################
#  CREATE SQLITE DATABASE  #
############################
echo
echo "[INFO] Creating SQLite databases"

if [ ! -f sdow.sqlite ]; then
  echo "[INFO] Creating redirects table"
  time zcat redirects.with_ids.txt.gz | sqlite3 sdow.sqlite ".read $ROOT_DIR/createRedirectsTable.sql"

  echo "[INFO] Creating pages table"
  time zcat pages.txt.gz | sqlite3 sdow.sqlite ".read $ROOT_DIR/createPagesTable.sql"

  echo "[INFO] Creating links table"
  time zcat links.with_ids.txt.gz | sqlite3 sdow.sqlite ".read $ROOT_DIR/createLinksTable.sql"
else
  echo "[WARN] Already created SQLite database"
fi


echo
echo "[INFO] All done!"
