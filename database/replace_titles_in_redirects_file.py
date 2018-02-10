"""
Replaces page titles in the redirects file with their corresponding IDs.

Output is written to stdout.
"""

import io
import sys
import gzip
from sets import Set
from __future__ import print_function

# Validate input arguments.
if len(sys.argv) < 3:
  print('[ERROR] Not enough arguments provided!')
  print('[INFO] Usage: {0} <pages_file> <redirects_file>'.format(sys.argv[0]))
  sys.exit()

PAGES_FILE = sys.argv[1]
REDIRECTS_FILE = sys.argv[2]

if not PAGES_FILE.endswith('.gz'):
  print('[ERROR] Pages file must be gzipped.')
  sys.exit()

if not REDIRECTS_FILE.endswith('.gz'):
  print('[ERROR] Redirects file must be gzipped.')
  sys.exit()

# Create a set of all page IDs and a dictionary of page titles to their corresponding IDs.
ALL_PAGE_IDS = Set()
PAGE_TITLES_TO_IDS = {}
for line in io.BufferedReader(gzip.open(PAGES_FILE, 'r')):
  [page_id, page_title, is_redirect] = line.rstrip('\n').split('\t')
  ALL_PAGE_IDS.add(page_id)
  PAGE_TITLES_TO_IDS[page_title] = page_id

# Replace each page title in the redirects file with its corresponding ID and write it to stdout.
for line in io.BufferedReader(gzip.open(REDIRECTS_FILE, 'r')):
  [from_page_id, to_page_title] = line.rstrip('\n').split('\t')

  from_page_exists = from_page_id in ALL_PAGE_IDS
  to_page_id = PAGE_TITLES_TO_IDS.get(to_page_title)

  if from_page_exists and to_page_id is not None:
    print('\t'.join([from_page_id, to_page_id]))
