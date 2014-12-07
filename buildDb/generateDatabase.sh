#!/bin/bash

if ($# != 1) then
  echo "Usage: " $0 " <YYYYMMDD>"
  echo "Description: Creates all the input files needed to run the findWikipediaLinks.py script by downloading a dump of Wikipedia from online."
  exit 1
endif

set DOWNLOAD_DATE = $1
set OUT_DIR = "dumps/dump.$DOWNLOAD_DATE"

mkdir -p $OUT_DIR

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

# Create the pages lookup file
if [ ! -f $OUT_DIR/pages.txt.gz ]; then
  echo "Creating the pages lookup file"
  gzcat $OUT_DIR/pages.sql.gz | sed -e 's/),(/\'$'\n/g' | sed -n '/INSERT INTO `page` VALUES (/,$p' | sed -e 's/INSERT INTO `page` VALUES (//' | awk -F, '{printf "%s\t%s\t",$DOWNLOAD_DATE,$2; for(i=3; i < NF; i++) printf "%s,", $i; print $NF;}' | sed -e "s/','.*/'/g" | awk -F'\t' '{if ($2 == 0) print $DOWNLOAD_DATE "\t" $3}' | sed -e "s/\t'/\t/" -e "s/'"'$'"//" | gzip >! $OUT_DIR/pages.txt.gz
else
  echo "Already created the pages lookup file"
fi

# Create the links lookup file
if [ ! -f $OUT_DIR/link.txt.gz ]; then
  echo "Creating the links lookup file"
  gzcat $OUT_DIR/links.sql.gz | sed -e 's/),(/\'$'\n/g' | sed -n '/INSERT INTO `pagelinks` VALUES (/,$p' | sed -e 's/INSERT INTO `pagelinks` VALUES (//' | awk -F, '{printf "%s\t%s\t", $DOWNLOAD_DATE, $2; for(i=3; i < NF; i++) printf "%s,", $i; print $NF;}' | awk -F'\t' '{if ($2 == 0) print $DOWNLOAD_DATE "\t" $3}' | sed -e "s/\t'/\t/" -e "s/'"'$'"//" | gzip >! $OUT_DIR/links.txt.gz
else
  echo "Already created the links lookup file"
fi

# Create the redirects lookup file
if [ ! -f $OUT_DIR/redirects.txt.gz ]; then
  echo "Creating the redirects lookup file"
  gzcat $OUT_DIR/redirects.sql.gz | sed -e 's/),(/\'$'\n/g' | sed -n '/INSERT INTO `redirect` VALUES (/,$p' | sed -e 's/INSERT INTO `redirect` VALUES (//' | awk -F, '{printf "%s\t%s\t",$DOWNLOAD_DATE,$2; for(i=3; i < NF; i++) printf "%s,", $i; print $NF;}' | sed -e "s/','.*/'/g" | awk -F'\t' '{if ($2 == 0) print $DOWNLOAD_DATE "\t" $3}' | sed -e "s/'//g" | gzip >! $OUT_DIR/redirects.txt.gz
else
  echo "Already created the redirects lookup file"
fi

# #Replace names in the links file with their corresponding ids
# echo "\nReplacing names in links file"
# replacePageNames.py $OUT_DIR/pages.txt.gz $OUT_DIR/links.txt.gz | gzip >! $OUT_DIR/links.with_ids.txt.gz

# #Replace names in the redirects file with their corresponding ids
# echo "Replacing names in redirects file"
# replacePageNames.py $OUT_DIR/pages.txt.gz $OUT_DIR/redirects.txt.gz | gzip >! $OUT_DIR/redirects.with_ids.txt.gz

# #Replace redirects in the links file with the page to which they redirect
# echo "Replacing redirects in links file"
# replaceLinkRedirects.py $OUT_DIR/pages.txt.gz $OUT_DIR/links.with_ids.txt.gz $OUT_DIR/redirects.with_ids.txt.gz | sort | uniq | gzip >! $OUT_DIR/links.no_redirects.txt.gz

# #Sort the pages file twice (once for each column)
# echo "\nSorting pages file on id"
# zcat $OUT_DIR/pages.txt.gz | sort -k1,1n | gzip >! $OUT_DIR/pages.id.sort.gz
# echo "Sorting pages file on name"
# zcat $OUT_DIR/pages.txt.gz | sort -k2,2 | gzip >! $OUT_DIR/pages.name.sort.gz

# #Sort the links file twice (once for each column)
# echo "Sorting links file on fromId"
# zcat $OUT_DIR/links.no_redirects.txt.gz | sort -k1,1n | gzip >! $OUT_DIR/links.from_id.sort.gz
# echo "Sorting links file on toId"
# zcat $OUT_DIR/links.no_redirects.txt.gz | sort -k2,2n | gzip >! $OUT_DIR/links.to_id.sort.gz

# #Sort the redirects file on the first column
# echo "Sorting redirects file on from_id"
# zcat $OUT_DIR/redirects.with_ids.txt.gz | sort -k1,1n | gzip >! $OUT_DIR/redirects.from_id.sort.gz

# #Create the pages sqlite databases
# echo "\nCreating pages id sqlite database"
# makePagesDb.py $OUT_DIR/pages.id.sort.gz $OUT_DIR/pages.id.sqlite "id"
# echo "Creating pages name sqlite database"
# makePagesDb.py $OUT_DIR/pages.name.sort.gz $OUT_DIR/pages.name.sqlite "name"

# #Create the links sqlite databases
# echo "Creating links from_id sqlite database"
# makeLinksDb.py $OUT_DIR/links.from_id.sort.gz $OUT_DIR/links.from_id.sqlite "from_id"
# echo "Creating links to_id sqlite database"
# makeLinksDb.py $OUT_DIR/links.to_id.sort.gz $OUT_DIR/links.to_id.sqlite "to_id"

# #Create the redirects sqlite database
# echo "Creating redirects from_id sqlite database"
# makeRedirectsDb.py $OUT_DIR/redirects.from_id.sort.gz $OUT_DIR/redirects.from_id.sqlite "from_id"

# #Move all the gzipped data files to a data directory
# echo "\nMoving files data files"
# mkdir $OUT_DIR/data
# mv $OUT_DIR/*.gz $OUT_DIR/data/

# echo "\nDone!"
