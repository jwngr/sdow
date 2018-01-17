"""
Adds a popularity column to the pages file based on the amount of incoming links to a page.

Output is written to stdout.
"""

import io
import sys
import gzip
from collections import defaultdict

# Validate inputs
if (len(sys.argv) < 3):
  print '[ERROR] Not enough arguments provided!'
  print '[INFO] Usage: {0} <pages_file> <links_file>'.format(sys.argv[0])
  sys.exit()

pages_file = sys.argv[1]
links_file = sys.argv[2]

if (pages_file.endswith('.gz') == False):
  print '[ERROR] Pages file must be gzipped.'
  sys.exit()

if (links_file.endswith('.gz') == False):
  print '[ERROR] Links file must be gzipped.'
  sys.exit()

# Create a dictionary of page IDs to popularity (that is, the number of incoming links to that page)
page_ids_to_popularity = defaultdict(int)
for line in io.BufferedReader(gzip.open(links_file, 'r')):
  [from_page_id, to_page_id] = line.rstrip('\n').split('\t')
  page_ids_to_popularity[to_page_id] += 1


# Loop through each page, rewriting it to stdout along with its popularity.
# TODO: What to do with pages with no incoming links? Currently their popularity is set to 0.
for line in io.BufferedReader(gzip.open(pages_file, 'r')):
  [page_id, page_name] = line.rstrip('\n').split('\t')
  print '{0}\t{1}\t{2}'.format(page_id, page_name, page_ids_to_popularity[page_id])
