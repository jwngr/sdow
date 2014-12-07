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
    print "Usage: " + sys.argv[0] + " <links_file> <database> <index_field>"
    print "Description: Creates a links database containing the 'from_id' and 'to_id' of each link in the gzipped links file. The database is indexed according to the -i option (which must be either 'from_id' or 'to_id'."
    sys.exit()

#Set the inputs
links_file = sys.argv[1]
database = sys.argv[2]
index_field = sys.argv[3]

#Make sure the links file is a gzipped file
if (links_file.endswith(".gz") == False):
    print "Error: Links file must be gzipped."
    sys.exit()

#Make sure the database is an sqlite database
if (database.endswith(".sqlite") == False):
    print "Error: Database must end in '.sqlite'."
    sys.exit()

#Make sure the index field is valid (either 'from_id' or 'to_id')
if ((index_field != "from_id") and (index_field != "to_id")):
    print "Error: Index field must be 'from_id' or 'to_id'."
    sys.exit()

###########################
#  Create links database  #
###########################

#Open the links file for reading
links_file = gzip.open(links_file, 'r')

#Connect to the links database
conn = sqlite3.connect(database)
c = conn.cursor()

#Drop the links table if it already exists
c.execute("DROP TABLE IF EXISTS links")

#Create the links table
c.execute("CREATE TABLE links(from_id INTEGER, to_id INTEGER)")
for line in links_file:
    tokens = line.rstrip('\n').split('\t')
    c.execute("INSERT INTO links VALUES(?, ?)", (tokens[0], tokens[1]))

#Save the changes
conn.commit()

##########################
#  Index links database  #
##########################

#Add an index to the links database according to the -i option
c.execute("CREATE INDEX " + index_field + "_index ON links(" + index_field + ")")

#Close the links database connection
c.close()
