"""
Replaces page names in the redirects file with their corresponding IDs.

Output is written to stdout.
"""

import io
import sys
import gzip
from sets import Set

# Validate inputs
if (len(sys.argv) < 3):
  print '[ERROR] Not enough arguments provided!'
  print '[INFO] Usage: {0} <pages_file> <redirects_file>'.format(sys.argv[0])
  sys.exit()

pages_file = sys.argv[1]
redirects_file = sys.argv[2]

if (pages_file.endswith('.gz') == False):
  print '[ERROR] Pages file must be gzipped.'
  sys.exit()

if (redirects_file.endswith('.gz') == False):
  print '[ERROR] Redirects file must be gzipped.'
  sys.exit()

# Create a dictionary of page names to IDs and a set of all page IDs
page_names_to_ids = {}
all_page_ids = Set()
for line in io.BufferedReader(gzip.open(pages_file, 'r')):
  [page_id, page_name] = line.rstrip('\n').split('\t')
  all_page_ids.add(page_id)
  page_names_to_ids[page_name] = page_id

# Replace each page name with its corresponding ID, writing the result to stdout
for line in io.BufferedReader(gzip.open(redirects_file, 'r')):
  [from_page_id, to_page_name] = line.rstrip('\n').split('\t')

  from_page_exists = from_page_id in all_page_ids
  to_page_exists = to_page_name in page_names_to_ids

  if (from_page_exists and to_page_exists):
    print '{0}\t{1}'.format(from_page_id, page_names_to_ids[to_page_name])
