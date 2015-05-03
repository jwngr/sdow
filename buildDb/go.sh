#!/bin/bash

# NOTE: Dumps of the English Wikipedia can be found at http://dumps.wikimedia.org/enwiki/

# Usage instructions
if [ ${#1} -ne 8 ]; then
  echo "Usage: " $0 " <YYYYMMDD>"
  echo "Description: Creates all the required files for findWikipediaLinks.py by downloading a dump of Wikipedia."
  exit 1
fi

# Set global variables
DOWNLOAD_DATE=$1
OUT_DIR="dumps/dump.$DOWNLOAD_DATE"
PWD=`pwd`

# Make the output directory if it doesn't already exist
mkdir -p $OUT_DIR

# Toggle which steps to run
download_wikipedia_dump=true
create_lookup_files=true
replace_names_with_ids=true
sort_files=true
create_sqlite_databases=true


##############################
#  DOWNLOAD WIKIPEDIA DUMPS  #
##############################
echo "*** STEP 0: Download Wikipedia dump from $DOWNLOAD_DATE into $PWD/$OUT_DIR ***"

if [ "$download_wikipedia_dump" = true ] ; then
  # Download the pages file from Wikipedia
  if [ ! -f $OUT_DIR/pages.sql.gz ]; then
    echo "*** Downloading pages file from Wikipedia ***"
    wget http://download.wikipedia.org/enwiki/$DOWNLOAD_DATE/enwiki-$DOWNLOAD_DATE-page.sql.gz
    mv enwiki-$DOWNLOAD_DATE-page.sql.gz $OUT_DIR/pages.sql.gz
  else
    echo "*** Already downloaded pages file from Wikipedia ***"
  fi

  # Download the links file from Wikipedia
  if [ ! -f $OUT_DIR/links.sql.gz ]; then
    echo "*** Downloading links file from Wikipedia ***"
    wget http://download.wikipedia.org/enwiki/$DOWNLOAD_DATE/enwiki-$DOWNLOAD_DATE-pagelinks.sql.gz
    mv enwiki-$DOWNLOAD_DATE-pagelinks.sql.gz $OUT_DIR/links.sql.gz
  else
    echo "*** Already downloaded links file from Wikipedia ***"
  fi

  # Download the redirects file from Wikipedia
  if [ ! -f $OUT_DIR/redirects.sql.gz ]; then
    echo "*** Downloading redirects file from Wikipedia ***"

    wget http://download.wikipedia.org/enwiki/$DOWNLOAD_DATE/enwiki-$DOWNLOAD_DATE-redirect.sql.gz
    mv enwiki-$DOWNLOAD_DATE-redirect.sql.gz $OUT_DIR/redirects.sql.gz
  else
    echo "*** Already downloaded redirects file from Wikipedia ***"
  fi
else
  echo "*** Skipping STEP 0 ***"
fi

echo "*** Done with STEP 0 ***"
echo


#########################
#  CREATE LOOKUP FILES  #
#########################
echo "*** STEP 1: Create lookup files in $PWD/$OUT_DIR ***"

# gzcat file
#   dumps a gzipped file

# sed -e 's/),(/\'$'\n/g'
#   Splits each table row into their own line

# sed -n '/INSERT INTO/,$p'
#   Removes all lines before the line containing "INSERT INTO"

# sed -e 's/INSERT INTO `<foo>` VALUES (//'
#   Replaces provided string with an empty string

# sed -n '/ALTER TABLE/q;p'
#   Removes all line after the line containing "ALTER TABLE"

# awk -F, '{printf "%s\t%s\t", $1, $2; for(i=3; i < NF; i++) printf "%s,", $i; print $NF;}'
#   Pretty-prints the desired data

# sed -e "s/','.*/'/g"
#   TODO

# awk -F'\t' '{if ($2 == 0) print $1 "\t" $3}'
#   TODO

# sed -e "s/\t'/\t/" -e "s/'"'$'"//"
#   TODO

# gzip
#  gzips the output

if [ "$create_lookup_files" = true ]; then
  # Create the pages lookup file
  if [ ! -f $OUT_DIR/pages.txt.gz ]; then
    echo "*** Creating the pages lookup file ***"
    gzcat $OUT_DIR/pages.sql.gz | LC_ALL=C sed -e 's/),(/\'$'\n/g' | LC_ALL=C sed -n '/INSERT INTO/,$p' | LC_ALL=C sed -e 's/INSERT INTO `page` VALUES (//' | LC_ALL=C sed -n '/ALTER TABLE/q;p' | awk -F, '{printf "%s\t%s\t", $1, $2; for(i=3; i < NF; i++) printf "%s,", $i; print $NF;}' | LC_ALL=C sed -e "s/','.*/'/g" | awk -F'\t' '{if ($2 == 0) print $1 "\t" $3}' | LC_ALL=C sed -e "s/\t'/\t/" -e "s/'"'$'"//" | gzip > $OUT_DIR/pages.txt.gz
  else
    echo "*** Already created the pages lookup file ***"
  fi

  # Create the links lookup file
  if [ ! -f $OUT_DIR/links.txt.gz ]; then
    echo "*** Creating the links lookup file ***"
    gzcat $OUT_DIR/links.sql.gz | LC_ALL=C sed -e 's/),(/\'$'\n/g' | LC_ALL=C sed -n '/INSERT INTO/,$p' | LC_ALL=C sed -e 's/INSERT INTO `pagelinks` VALUES (//' | LC_ALL=C sed -n '/ALTER TABLE/q;p' | awk -F, '{printf "%s\t%s\t", $1, $2; for(i=3; i < NF; i++) printf "%s,", $i; print $NF;}' | awk -F'\t' '{if ($2 == 0) print $1 "\t" $3}' | LC_ALL=C sed -e "s/\t'/\t/" -e "s/'"'$'"//" | gzip > $OUT_DIR/links.txt.gz
  else
    echo "*** Already created the links lookup file ***"
  fi

  # Create the redirects lookup file
  if [ ! -f $OUT_DIR/redirects.txt.gz ]; then
    echo "*** Creating the redirects lookup file ***"
    gzcat $OUT_DIR/redirects.sql.gz | LC_ALL=C sed -e 's/),(/\'$'\n/g' | LC_ALL=C sed -n '/INSERT INTO/,$p' | LC_ALL=C sed -e 's/INSERT INTO `redirect` VALUES (//' | LC_ALL=C sed -n '/ALTER TABLE/q;p' | awk -F, '{printf "%s\t%s\t", $1, $2; for(i=3; i < NF; i++) printf "%s,", $i; print $NF;}' | LC_ALL=C sed -e "s/','.*/'/g" | awk -F'\t' '{if ($2 == 0) print $1 "\t" $3}' | LC_ALL=C sed -e "s/'//g" | gzip > $OUT_DIR/redirects.txt.gz
  else
    echo "*** Already created the redirects lookup file ***"
  fi
else
  echo "*** Skipping STEP 1 ***"
fi

echo "*** Done with STEP 1 ***"
echo


############################
#  REPLACE NAMES WITH IDS  #
############################
echo "*** STEP 2: Replace names with IDs ***"

if [ "$replace_names_with_ids" = true ]; then
  # Replace names in the links file with their corresponding ids
  if [ ! -f $OUT_DIR/links.with_ids.txt.gz ]; then
    echo "***  Replacing names in links file ***"
    python buildDb/replacePageNames.py $OUT_DIR/pages.txt.gz $OUT_DIR/links.txt.gz | gzip > $OUT_DIR/links.with_ids.txt.gz
  else
      echo "***  Already replaced names in links file ***"
  fi

  # Replace names in the redirects file with their corresponding ids
  if [ ! -f $OUT_DIR/redirects.with_ids.txt.gz ]; then
    echo "***  Replacing names in redirects file ***"
    python buildDb/replacePageNames.py $OUT_DIR/pages.txt.gz $OUT_DIR/redirects.txt.gz | gzip > $OUT_DIR/redirects.with_ids.txt.gz
  else
    echo "*** Already replaced names in redirects file ***"
  fi

  # Replace redirects in the links file with the page to which they redirect
  if [ ! -f $OUT_DIR/links.no_redirects.txt.gz ]; then
    echo "*** Replacing redirects in links file ***"
    python buildDb/replaceLinkRedirects.py $OUT_DIR/pages.txt.gz $OUT_DIR/links.with_ids.txt.gz $OUT_DIR/redirects.with_ids.txt.gz | sort | uniq | gzip > $OUT_DIR/links.no_redirects.txt.gz
  else
    echo "*** Already replaced redirects in links file ***"
  fi
else
  echo "*** Skipping STEP 2 ***"
fi

echo "*** Done with STEP 2 ***"
echo


# ################
# #  SORT FILES  #
# ################
echo "*** STEP 3: Sort files ***"

if [ "$sort_files" = true ]; then
  # Sort the pages file on ID
  if [ ! -f $OUT_DIR/pages.id.sort.gz ]; then
    echo "***  Sorting pages file on ID ***"
    gzcat $OUT_DIR/pages.txt.gz | sort -k1,1n | gzip > $OUT_DIR/pages.id.sort.gz
  else
    echo "***  Already sorted pages file on ID ***"
  fi

  # Sort the pages file on name
  if [ ! -f $OUT_DIR/pages.id.sort.gz ]; then
    echo "***  Sorting pages file on name ***"
    gzcat $OUT_DIR/pages.txt.gz | sort -k2,2 | gzip > $OUT_DIR/pages.name.sort.gz
  else
    echo "***  Already sorted pages file on name ***"
  fi

  # Sort the links file on from_id
  if [ ! -f $OUT_DIR/links.from_id.sort.gz ]; then
    echo "***  Sorting links file on from_id ***"
    gzcat $OUT_DIR/links.no_redirects.txt.gz | sort -k1,1n | gzip > $OUT_DIR/links.from_id.sort.gz
  else
    echo "***  Already sorted links file on from_id ***"
  fi

  # Sort the links file on to_id
  if [ ! -f $OUT_DIR/links.to_id.sort.gz ]; then
    echo "***  Sorting links file on to_id ***"
    gzcat $OUT_DIR/links.no_redirects.txt.gz | sort -k2,2n | gzip > $OUT_DIR/links.to_id.sort.gz
  else
    echo "***  Already sorted links file on to_id ***"
  fi

  # Sort the redirects file on from_id
  if [ ! -f $OUT_DIR/redirects.from_id.sort.gz ]; then
    echo "***  Sorting redirects file on from_id ***"
    gzcat $OUT_DIR/redirects.with_ids.txt.gz | sort -k1,1n | gzip > $OUT_DIR/redirects.from_id.sort.gz
  else
    echo "***  Already sorted redirects file on from_id ***"
  fi
else
  echo "*** Skipping STEP 3 ***"
fi

echo "*** Done with STEP 3 ***"
echo


# #############################
# #  CREATE SQLITE DATABASES  #
# #############################
echo "*** STEP 4: Create SQLite databases ***"

if [ "$create_sqlite_databases" = true ] ; then
  # Create the pages ID SQLite database
  if [ ! -f $OUT_DIR/pages.id.sqlite ]; then
    echo "***  Creating pages ID SQLite database ***"
    python makePagesDb.py $OUT_DIR/pages.id.sort.gz $OUT_DIR/pages.id.sqlite "id"
  else
    echo "***  Already created pages ID SQLite database ***"
  fi

  # Create the pages name SQLite database
  if [ ! -f $OUT_DIR/pages.name.sqlite ]; then
    echo "***  Creating pages name sqlite database ***"
    python makePagesDb.py $OUT_DIR/pages.name.sort.gz $OUT_DIR/pages.name.sqlite "name"
  else
    echo "***  Already created pages name SQLite database ***"
  fi

  # Create the links from_id SQLite database
  if [ ! -f $OUT_DIR/links.from_id.sqlite ]; then
    echo "***  Creating links from_id SQLite database ***"
    python makeLinksDb.py $OUT_DIR/links.from_id.sort.gz $OUT_DIR/links.from_id.sqlite "from_id"
  else
    echo "***  Already created link from_id SQLite database ***"
  fi

  # Create the links to_id SQLite database
  if [ ! -f $OUT_DIR/links.to_id.sqlite ]; then
    echo "***  Creating links to_id SQLite database ***"
    python makeLinksDb.py $OUT_DIR/links.to_id.sort.gz $OUT_DIR/links.to_id.sqlite "to_id"
  else
    echo "***  Already created link to_id SQLite database ***"
  fi

  # Create the redirects SQLite database
  if [ ! -f $OUT_DIR/redirects.from_id.sqlite ]; then
    echo "***  Creating redirects from_id SQLite database ***"
    python makeRedirectsDb.py $OUT_DIR/redirects.from_id.sort.gz $OUT_DIR/redirects.from_id.sqlite "from_id"
  else
    echo "***  Already created redirects from_id SQLite database ***"
  fi
else
  echo "*** Skipping STEP 4 ***"
fi

echo "*** Done with STEP 4 ***"
echo
echo "*** Woot! All done! ***"
