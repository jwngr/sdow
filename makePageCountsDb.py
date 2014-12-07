#!/usr/bin/env python

#Import necessary modules
import sys
import gzip
import sqlite3

#####################
#  Validate inputs  #
#####################

#If the user does not specify enough parameters, print the usage and exit the program
if (len(sys.argv) < 4):
    print "Usage: " + sys.argv[0] + " <pagecounts_file> <database> <index_field>"
    print "Description: Creates a pagecounts database containing the 'name' and 'count' of each page in the gzipped pagecounts file. The database is indexed according to the -i option (which must be either 'name' or 'count')."
    sys.exit()

#Set the inputs
pagecounts_file = sys.argv[1]
database = sys.argv[2]
index_field = sys.argv[3]

#Make sure the pagecounts file is a gzipped file
if (pagecounts_file.endswith(".gz") == False):
    print "Error: Page counts file must be gzipped."
    sys.exit()

#Make sure the database is an sqlite database
if (database.endswith(".sqlite") == False):
    print "Error: Database must end in '.sqlite'."
    sys.exit()

#Make sure the index field is valid (either 'name' or 'id')
if ((index_field != "name") and (index_field != "count")):
    print "Error: Index field must be 'name' or 'count'."
    sys.exit()

################################
#  Create pagecounts database  #
################################
#Open the pagecounts file for reading
pagecounts_file = gzip.open(pagecounts_file, 'r')

#Connect to the pagecounts database
conn = sqlite3.connect(database)
c = conn.cursor()

#Drop the pagecounts table if it already exists
c.execute("DROP TABLE IF EXISTS pagecounts")

#Create the pagecounts table
c.execute("CREATE TABLE pagecounts(count INTEGER, name TEXT)")
for line in pagecounts_file:
    line = unicode(line, 'utf_8')
    tokens = line.rstrip('\n').split('\t')
    if (tokens[1] != ' '):
        c.execute("INSERT INTO pagecounts VALUES(?, ?)", (tokens[1], tokens[0]))

#Save the changes
conn.commit()

###############################
#  Index pagecounts database  #
###############################
#Add an index to the pagecounts database according to the -i option
c.execute("CREATE INDEX " + index_field + "_index ON pagecounts(" + index_field + ")")

#Close the pagecounts database connection
c.close()
