#!/bin/bash

# NOTE: Dumps of the English Wikipedia can be found at http://dumps.wikimedia.org/enwiki/

if [ ${#1} -ne 8 ]; then
  echo "Usage: " $0 " <YYYYMMDD>"
  echo "Description: Creates all the input files needed to run the findWikipediaLinks.py script by downloading a dump of Wikipedia from online."
  exit 1
fi

DOWNLOAD_DATE=$1
OUT_DIR="dumps/dump.$DOWNLOAD_DATE"
PWD=`pwd`

echo "Downloading Wikipedia dump from $DOWNLOAD_DATE into $PWD/$OUT_DIR"
echo

mkdir -p $OUT_DIR


##############################
#  DOWNLOAD WIKIPEDIA DUMPS  #
##############################
# Download the pages file from Wikipeida
if [ ! -f $OUT_DIR/pages.sql.gz ]; then
  echo "Downloading pages file from Wikipedia"
  wget http://download.wikipedia.org/enwiki/$DOWNLOAD_DATE/enwiki-$DOWNLOAD_DATE-page.sql.gz
  mv enwiki-$DOWNLOAD_DATE-page.sql.gz $OUT_DIR/pages.sql.gz
else
  echo "Already downloaded pages file from Wikipedia"
fi

# Download the links file from Wikipeida
if [ ! -f $OUT_DIR/links.sql.gz ]; then
  echo "Downloading links file from Wikipedia"
  wget http://download.wikipedia.org/enwiki/$DOWNLOAD_DATE/enwiki-$DOWNLOAD_DATE-pagelinks.sql.gz
  mv enwiki-$DOWNLOAD_DATE-pagelinks.sql.gz $OUT_DIR/links.sql.gz
else
  echo "Already downloaded links file from Wikipedia"
fi

# Download the redirects file from Wikipeida
if [ ! -f $OUT_DIR/redirects.sql.gz ]; then
  echo "Downloading redirects file from Wikipedia"

  wget http://download.wikipedia.org/enwiki/$DOWNLOAD_DATE/enwiki-$DOWNLOAD_DATE-redirect.sql.gz
  mv enwiki-$DOWNLOAD_DATE-redirect.sql.gz $OUT_DIR/redirects.sql.gz
else
  echo "Already downloaded redirects file from Wikipedia"
fi

echo


#########################
#  CREATE LOOKUP FILES  #
#########################
# Create the pages lookup file
if [ ! -f $OUT_DIR/pages.txt.gz ]; then
  echo "Creating the pages lookup file"
  gzcat $OUT_DIR/pages.sql.gz | LC_ALL=C sed -e 's/),(/\'$'\n/g' | LC_ALL=C sed -n '/INSERT INTO `page` VALUES (/,$p' | LC_ALL=C sed -e 's/INSERT INTO `page` VALUES (//' | awk -F, '{printf "%s\t%s\t", $1, $2; for(i=3; i < NF; i++) printf "%s,", $i; print $NF;}' | LC_ALL=C sed -e "s/','.*/'/g" | awk -F'\t' '{if ($2 == 0) print $1 "\t" $3}' | LC_ALL=C sed -e "s/\t'/\t/" -e "s/'"'$'"//" | gzip > $OUT_DIR/pages.txt.gz
else
  echo "Already created the pages lookup file"
fi

# Create the links lookup file
if [ ! -f $OUT_DIR/links.txt.gz ]; then
  echo "Creating the links lookup file"
  gzcat $OUT_DIR/links.sql.gz | LC_ALL=C sed -e 's/),(/\'$'\n/g' | LC_ALL=C sed -n '/INSERT INTO `pagelinks` VALUES (/,$p' | LC_ALL=C sed -e 's/INSERT INTO `pagelinks` VALUES (//' | awk -F, '{printf "%s\t%s\t", $1, $2; for(i=3; i < NF; i++) printf "%s,", $i; print $NF;}' | awk -F'\t' '{if ($2 == 0) print $1 "\t" $3}' | LC_ALL=C sed -e "s/\t'/\t/" -e "s/'"'$'"//" | gzip > $OUT_DIR/links.txt.gz
else
  echo "Already created the links lookup file"
fi

# Create the redirects lookup file
if [ ! -f $OUT_DIR/redirects.txt.gz ]; then
  echo "Creating the redirects lookup file"
  gzcat $OUT_DIR/redirects.sql.gz | LC_ALL=C sed -e 's/),(/\'$'\n/g' | LC_ALL=C sed -n '/INSERT INTO `redirect` VALUES (/,$p' | LC_ALL=C sed -e 's/INSERT INTO `redirect` VALUES (//' | awk -F, '{printf "%s\t%s\t", $1, $2; for(i=3; i < NF; i++) printf "%s,", $i; print $NF;}' | LC_ALL=C sed -e "s/','.*/'/g" | awk -F'\t' '{if ($2 == 0) print $1 "\t" $3}' | LC_ALL=C sed -e "s/'//g" | gzip > $OUT_DIR/redirects.txt.gz
else
  echo "Already created the redirects lookup file"
fi

echo


############################
#  REPLACE NAMES WITH IDS  #
############################
# Replace names in the links file with their corresponding ids
if [ ! -f $OUT_DIR/links.with_ids.txt.gz ]; then
  echo "Replacing names in links file"
  python buildDb/replacePageNames.py $OUT_DIR/pages.txt.gz $OUT_DIR/links.txt.gz | gzip > $OUT_DIR/links.with_ids.txt.gz
else
    echo "Already replaced names in links file"
fi

# Replace names in the redirects file with their corresponding ids
if [ ! -f $OUT_DIR/redirects.with_ids.txt.gz ]; then
  echo "Replacing names in redirects file"
  python buildDb/replacePageNames.py $OUT_DIR/pages.txt.gz $OUT_DIR/redirects.txt.gz | gzip > $OUT_DIR/redirects.with_ids.txt.gz
else
  echo "Already replaced names in redirects file"
fi

# Replace redirects in the links file with the page to which they redirect
if [ ! -f $OUT_DIR/links.no_redirects.txt.gz ]; then
  echo "Replacing redirects in links file"
  python buildDb/replaceLinkRedirects.py $OUT_DIR/pages.txt.gz $OUT_DIR/links.with_ids.txt.gz $OUT_DIR/redirects.with_ids.txt.gz | sort | uniq | gzip > $OUT_DIR/links.no_redirects.txt.gz
else
  echo "Already replaced redirects in links file"
fi

echo


################
#  SORT FILES  #
################
# Sort the pages file on ID
if [ ! -f $OUT_DIR/pages.id.sort.gz ]; then
  echo "Sorting pages file on ID"
  gzcat $OUT_DIR/pages.txt.gz | sort -k1,1n | gzip > $OUT_DIR/pages.id.sort.gz
else
  echo "Already sorted pages file on ID"
fi

# Sort the pages file on name
if [ ! -f $OUT_DIR/pages.id.sort.gz ]; then
  echo "Sorting pages file on name"
  gzcat $OUT_DIR/pages.txt.gz | sort -k2,2 | gzip > $OUT_DIR/pages.name.sort.gz
else
  echo "Already sorted pages file on name"
fi

# Sort the links file on from_id
if [ ! -f $OUT_DIR/links.from_id.sort.gz ]; then
  echo "Sorting links file on from_id"
  gzcat $OUT_DIR/links.no_redirects.txt.gz | sort -k1,1n | gzip > $OUT_DIR/links.from_id.sort.gz
else
  echo "Already sorted links file on from_id"
fi

# Sort the links file on to_id
if [ ! -f $OUT_DIR/links.to_id.sort.gz ]; then
  echo "Sorting links file on to_id"
  gzcat $OUT_DIR/links.no_redirects.txt.gz | sort -k2,2n | gzip > $OUT_DIR/links.to_id.sort.gz
else
  echo "Already sorted links file on to_id"
fi

# Sort the redirects file on from_id
if [ ! -f $OUT_DIR/redirects.from_id.sort.gz ]; then
  echo "Sorting redirects file on from_id"
  gzcat $OUT_DIR/redirects.with_ids.txt.gz | sort -k1,1n | gzip > $OUT_DIR/redirects.from_id.sort.gz
else
  echo "Already sorted redirects file on from_id"
fi

echo


#############################
#  CREATE SQLITE DATABASES  #
#############################
# Create the pages ID SQLite database
if [ ! -f $OUT_DIR/pages.id.sqlite ]; then
  echo "Creating pages ID SQLite database"
  python makePagesDb.py $OUT_DIR/pages.id.sort.gz $OUT_DIR/pages.id.sqlite "id"
else
  echo "Already created pages ID SQLite database"
fi

# Create the pages name SQLite database
if [ ! -f $OUT_DIR/pages.name.sqlite ]; then
  echo "Creating pages name sqlite database"
  python makePagesDb.py $OUT_DIR/pages.name.sort.gz $OUT_DIR/pages.name.sqlite "name"
else
  echo "Already created pages name SQLite database"
fi

# Create the links from_id SQLite database
if [ ! -f $OUT_DIR/links.from_id.sqlite ]; then
  echo "Creating links from_id SQLite database"
  python makeLinksDb.py $OUT_DIR/links.from_id.sort.gz $OUT_DIR/links.from_id.sqlite "from_id"
else
  echo "Already created link from_id SQLite database"
fi

# Create the links to_id SQLite database
if [ ! -f $OUT_DIR/links.to_id.sqlite ]; then
  echo "Creating links to_id SQLite database"
  python makeLinksDb.py $OUT_DIR/links.to_id.sort.gz $OUT_DIR/links.to_id.sqlite "to_id"
else
  echo "Already created link to_id SQLite database"
fi

# Create the redirects SQLite database
if [ ! -f $OUT_DIR/redirects.from_id.sqlite ]; then
  echo "Creating redirects from_id SQLite database"
  python makeRedirectsDb.py $OUT_DIR/redirects.from_id.sort.gz $OUT_DIR/redirects.from_id.sqlite "from_id"
else
  echo "Already created redirects from_id SQLite database"
fi

echo
echo "Done!"
