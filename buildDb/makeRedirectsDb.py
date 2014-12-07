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
    print "Usage: " + sys.argv[0] + " <redirects_file> <database> <index_field>"
    print "Description: Creates a redirects database containing the 'from_id' and 'to_id' of each redirect in the gzipped redirects file. The database is indexed according to the -i option (which must be either 'from_id' or 'to_id'."
    sys.exit()

#Set the inputs
redirects_file = sys.argv[1]
database = sys.argv[2]
index_field = sys.argv[3]

#Make sure the redirects file is a gzipped file
if (redirects_file.endswith(".gz") == False):
    print "Error: Redirects file must be gzipped."
    sys.exit()

#Make sure the database is an sqlite database
if (database.endswith(".sqlite") == False):
    print "Error: Database must end in '.sqlite'."
    sys.exit()

#Make sure the index field is valid (either 'from_id' or 'to_id')
if ((index_field != "from_id") and (index_field != "to_id")):
    print "Error: Index field must be 'from_id' or 'to_id'."
    sys.exit()

###############################
#  Create redirects database  #
###############################

#Open the redirects file for reading
redirects_file = gzip.open(redirects_file, 'r')

#Connect to the redirects database
conn = sqlite3.connect(database)
c = conn.cursor()

#Drop the redirects table if it already exists
c.execute("DROP TABLE IF EXISTS redirects")

#Create the redirects table
c.execute("CREATE TABLE redirects(from_id INTEGER, to_id INTEGER)")
for line in redirects_file:
    tokens = line.rstrip('\n').split('\t')
    c.execute("INSERT INTO redirects VALUES(?, ?)", (tokens[0], tokens[1]))

#Save the changes
conn.commit()

##############################
#  Index redirects database  #
##############################

#Add an index to the redirects database according to the -i option
c.execute("CREATE INDEX " + index_field + "_index ON redirects(" + index_field + ")")

#Close the redirects database connection
c.close()
