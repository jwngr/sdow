#!/usr/bin/env python

#Import necessary modules
import sys
import gzip

#####################
#  Validate inputs  #
#####################

#If the user does not specify enough parameters, print the usage and exit the program
if (len(sys.argv) < 4):
    print "Usage: " + sys.argv[0] + " <pages_file> <links_file> <redirects_file>"
    print "Description: Cleans up the links file by eliminating links which contain non-existing pages and by replacing redirects with the pages to which they redirect. Output is written to stdout."
    sys.exit()

#Set the inputs
pages_file = sys.argv[1]
links_file = sys.argv[2]
redirects_file = sys.argv[3]

#Make sure the pages file is a gzipped file
if (pages_file.endswith(".gz") == False):
    print "Error: Pages file must be gzipped."
    sys.exit()

#Make sure the links file is a gzipped file
if (links_file.endswith(".gz") == False):
    print "Error: Links file must be gzipped."
    sys.exit()

#Make sure the redirects file is a gzipped file
if (redirects_file.endswith(".gz") == False):
    print "Error: Redirects file must be gzipped."
    sys.exit()

#############################
#  Create pages dictionary  #
#############################

#Open the pages file for reading
pages_file = gzip.open(pages_file, 'r')

#Create a dictionary of pages
pages = {}
for line in pages_file:
    tokens = line.rstrip('\n').split('\t')
    pages[tokens[0]] = 0

#################################
#  Create redirects dictionary  #
#################################

#Open the redirects file for reading
redirects_file = gzip.open(redirects_file, 'r')

#Create a dictionary from the redirect page's id to the id of the page to which it redirects
redirects = {}
for line in redirects_file:
    tokens = line.rstrip('\n').split('\t')
    redirects[tokens[0]] = tokens[1]

#########################################
#  Replace redirects in the links file  #
#########################################

#Open the links file for reading
links_file = gzip.open(links_file, 'r')

#Loop through each link, making sure both of its pages exist and replacing any redirects it contains
for line in links_file:
    tokens = line.rstrip('\n').split('\t')
    
    #Make sure both pages in the link exist
    if ((pages.has_key(tokens[0])) and (pages.has_key(tokens[1]))):
        
        #Make sure the from page is not a redirect
        if (redirects.has_key(tokens[0]) == False):

            #If the to page is a redirect, make the link go from the from page to the page to which the to page points
            if (redirects.has_key(tokens[1])):
                print tokens[0] + "\t" + redirects[tokens[1]]
            
            #Otherwise, print the link without modification
            else:
                print tokens[0] + "\t" + tokens[1]
