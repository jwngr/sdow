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
    print "Usage: " + sys.argv[0] + " <pages_file> <database> <index_field>"
    print "Description: Creates a pages database containing the 'name' and 'id' of each page in the gzipped pages file. The database is indexed according to the -i option (which must be either 'name' or 'id'."
    sys.exit()

#Set the inputs
pages_file = sys.argv[1]
database = sys.argv[2]
index_field = sys.argv[3]

#Make sure the pages file is a gzipped file
if (pages_file.endswith(".gz") == False):
    print "Error: Pages file must be gzipped."
    sys.exit()

#Make sure the database is an sqlite database
if (database.endswith(".sqlite") == False):
    print "Error: Database must end in '.sqlite'."
    sys.exit()

#Make sure the index field is valid (either 'name' or 'id')
if ((index_field != "name") and (index_field != "id")):
    print "Error: Index field must be 'name' or 'id'."
    sys.exit()

###########################
#  Create pages database  #
###########################

#Open the pages file for reading
pages_file = gzip.open(pages_file, 'r')

#Connect to the pages database
conn = sqlite3.connect(database)
c = conn.cursor()

#Drop the pages table if it already exists
c.execute("DROP TABLE IF EXISTS pages")

#Create the pages table
c.execute("CREATE TABLE pages(id INTEGER, name TEXT)")
for line in pages_file:
    line = unicode(line, 'utf_8')
    tokens = line.rstrip('\n').split('\t')
    if (tokens[1] != ' '):
        c.execute("INSERT INTO pages VALUES(?, ?)", (tokens[0], tokens[1]))

#Save the changes
conn.commit()

##########################
#  Index pages database  #
##########################

#Add an index to the pages database according to the -i option
c.execute("CREATE INDEX " + index_field + "_index ON pages(" + index_field + ")")

#Close the pages database connection
c.close()
