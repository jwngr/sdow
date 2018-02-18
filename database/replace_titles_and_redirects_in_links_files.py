"""
Replaces page names in the links file with their corresponding IDs, eliminates links containing
non-existing pages, and replaces redirects with the pages to which they redirect.

Output is written to stdout.
"""

from __future__ import print_function

import io
import sys
import gzip
from sets import Set

# Validate inputs
if len(sys.argv) < 4:
  print('[ERROR] Not enough arguments provided!')
  print('[INFO] Usage: {0} <pages_file> <redirects_file> <links_file>'.format(sys.argv[0]))
  sys.exit()

PAGES_FILE = sys.argv[1]
REDIRECTS_FILE = sys.argv[2]
LINKS_FILE = sys.argv[3]

if not PAGES_FILE.endswith('.gz'):
  print('[ERROR] Pages file must be gzipped.')
  sys.exit()

if not REDIRECTS_FILE.endswith('.gz'):
  print('[ERROR] Redirects file must be gzipped.')
  sys.exit()

if not LINKS_FILE.endswith('.gz'):
  print('[ERROR] Links file must be gzipped.')
  sys.exit()

# Create a set of all page IDs and a dictionary of page titles to their corresponding IDs.
ALL_PAGE_IDS = Set()
PAGE_TITLES_TO_IDS = {}
for line in io.BufferedReader(gzip.open(PAGES_FILE, 'r')):
  [page_id, page_title, is_redirect] = line.rstrip('\n').split('\t')
  ALL_PAGE_IDS.add(page_id)
  PAGE_TITLES_TO_IDS[page_title] = page_id

# Create a dictionary from page ID to the ID of the page to which it redirects.
REDIRECTS = {}
for line in io.BufferedReader(gzip.open(REDIRECTS_FILE, 'r')):
  [from_page_id, to_page_id] = line.rstrip('\n').split('\t')
  REDIRECTS[from_page_id] = to_page_id

# Loop through each line in the links file, replacing titles with IDs, applying redirects, and
# removing nonexistent pages, writing the result to stdout.
for line in io.BufferedReader(gzip.open(LINKS_FILE, 'r')):
  [from_page_id, to_page_title] = line.rstrip('\n').split('\t')

  from_page_exists = from_page_id in ALL_PAGE_IDS

  if from_page_exists:
    from_page_id = REDIRECTS.get(from_page_id, from_page_id)

    to_page_id = PAGE_TITLES_TO_IDS.get(to_page_title)

    if to_page_id is not None:
      to_page_id = REDIRECTS.get(to_page_id, to_page_id)
      print('\t'.join([from_page_id, to_page_id]))
