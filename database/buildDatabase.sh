#!/bin/bash

set -euo pipefail

# Force default language for output sorting to be bytewise.
export LC_ALL=C

# By default, the latest Wikipedia dump will be downloaded. If a download date in the format
# YYYYMMDD is provided as the first argument, it will be used instead.
if [[ $# -eq 0 ]]; then
  DOWNLOAD_DATE=$(wget -q -O- https://dumps.wikimedia.your.org/enwiki/ | grep -Po '\d{8}' | sort | tail -n1)
else
  if [ ${#1} -ne 8 ]; then
    DOWNLOAD_DATE="latest"
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
PAGES_MULTISTREAM="enwiki-$DOWNLOAD_DATE-pages-articles-multistream.xml.bz2"
PAGES_MULTISTREAM_INDEX="enwiki-$DOWNLOAD_DATE-pages-articles-multistream-index.txt.bz2"


# Make the output directory if it doesn't already exist and move to it
mkdir -p $OUT_DIR
pushd $OUT_DIR


echo "[INFO] Download URL: $DOWNLOAD_URL"
echo "[INFO] Output directory: $OUT_DIR"

##############################
#  DOWNLOAD WIKIPEDIA DUMPS  #
##############################

function grab() {
  if [ ! -f $2 ]; then
    echo
    echo "[INFO] Downloading $1 file"
    if [ $1 != sha1sums ] && command -v aria2c > /dev/null; then
      # we can download using torrents!
      aria2c --summary-interval=0 --console-log-level=warn --seed-time=0 \
        "$TORRENT_URL/$2.torrent"
    else
      wget --progress=dot:giga "$DOWNLOAD_URL/$2"
    fi
    if [ $1 != sha1sums ]; then
      grep "$2" "$SHA1SUM_FILENAME" | time sha1sum -c
      if [ $? -ne 0 ]; then
        echo
        echo "[ERROR] Downloaded $1 file has incorrect sha1sum"
        rm $2
        exit 1
      fi
    fi
  else
    echo "[WARN] already downloaded $1 file"
  fi
}

grab sha1sums $SHA1SUM_FILENAME
grab redirects $REDIRECTS_FILENAME
grab pageIDs $PAGES_FILENAME
grab pages $PAGES_MULTISTREAM
grab "pages index" $PAGES_MULTISTREAM_INDEX

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
    | pigz -1 > redirects.txt.gz.tmp
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
    | sed -e $"s/','[^,]*,[^,]*,\([01]\).*/\t\1/" \
    | pigz -1 > pages.txt.gz.tmp
  mv pages.txt.gz.tmp pages.txt.gz
else
  echo "[WARN] Already trimmed pages file"
fi

###########################################
#  REPLACE TITLES AND REDIRECTS IN FILES  #
###########################################
if [ ! -f redirects.with_ids.txt.gz ]; then
  echo
  echo "[INFO] Replacing titles in redirects file"
  time python "$ROOT_DIR/replace_titles_in_redirects_file.py" pages.txt.gz redirects.txt.gz \
    | sort -S 100% -t $'\t' -k 1n,1n \
    | pigz -1 > redirects.with_ids.txt.gz.tmp
  mv redirects.with_ids.txt.gz.tmp redirects.with_ids.txt.gz
else
  echo "[WARN] Already replaced titles in redirects file"
fi

#######################
#  CREATE LINKS FILE  #
#######################
if [ ! -f links.forward.txt.gz ]; then
  echo
  echo "[INFO] Extracting forward links from multistream database dump"
  time go run "$ROOT_DIR/generate_links.go" pages.txt.gz redirects.with_ids.txt.gz $PAGES_MULTISTREAM $PAGES_MULTISTREAM_INDEX \
    | pigz -1 > links.forward.txt.gz.tmp
  mv links.forward.txt.gz.tmp links.forward.txt.gz
else
  echo "[WARN] Already extracted forward links"
fi

if [ ! -f links.with_counts.txt.gz ]; then
  echo
  echo "[INFO] Creating backwards links for DB import"
  time go run "$ROOT_DIR/make_reverse_links_and_counts.go" links.forward.txt.gz \
    | pigz -1 > links.with_counts.txt.gz.tmp
  mv links.with_counts.txt.gz.tmp links.with_counts.txt.gz
else
  echo "[WARN] Already created backwards links for DB import"
fi

############################
#  CREATE SQLITE DATABASE  #
############################
if [ ! -f sdow.sqlite ]; then
  echo
  echo "[INFO] Creating redirects table"
  time pigz -dc redirects.with_ids.txt.gz | sqlite3 sdow.sqlite ".read $ROOT_DIR/createRedirectsTable.sql"

  echo
  echo "[INFO] Creating pages table"
  time pigz -dc pages.txt.gz | sqlite3 sdow.sqlite ".read $ROOT_DIR/createPagesTable.sql"

  echo
  echo "[INFO] Creating links table"
  time pigz -dc links.with_counts.txt.gz | sqlite3 sdow.sqlite ".read $ROOT_DIR/createLinksTable.sql"

  echo
  echo "[INFO] Creating searches table"
  time sqlite3 sdow.sqlite ".read $ROOT_DIR/createSearchesTable.sql"
else
  echo "[WARN] Already created SQLite database"
fi


echo
echo "[INFO] All done!"
