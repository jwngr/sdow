#!/usr/bin/env python

#Import necessary modules
import sys
import gzip

#####################
#  Validate inputs  #
#####################

#If the user does not specify enough parameters, print the usage and exit the program
if (len(sys.argv) < 3):
    print "Usage: " + sys.argv[0] + " <pages_file> <replacement_file>"
    print "Description: Replaces the page names in the replacement file with their corresponding ids. Output is written to stdout."
    sys.exit()

#Set the inputs
pages_file = sys.argv[1]
replacement_file = sys.argv[2]

#Make sure the pages file is a gzipped file
if (pages_file.endswith(".gz") == False):
    print "Error: Pages file must be gzipped."
    sys.exit()

#Make sure the replacement file is a gzipped file
if (replacement_file.endswith(".gz") == False):
    print "Error: Replacement file must be gzipped."
    sys.exit()

#############################
#  Create pages dictionary  #
#############################

#Open the pages file for reading
pages_file = gzip.open(pages_file, 'r')

#Create a dictionary of pages
pages = {}
ids = {}
for line in pages_file:
    tokens = line.rstrip('\n').split('\t')
    ids[tokens[0]] = 0
    pages[tokens[1]] = tokens[0]

#################################
#  Replace page names with ids  #
#################################

#Open the replacement file for reading
replacement_file = gzip.open(replacement_file, 'r')

#Replace each page name with its corresponding id
for line in replacement_file:
    tokens = line.rstrip('\n').split('\t')
    if ((ids.has_key(tokens[0])) and (pages.has_key(tokens[1]))):
        print tokens[0] + "\t" + pages[tokens[1]]
