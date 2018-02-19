"""
Replaces page titles in the redirects file with their corresponding IDs.

Output is written to stdout.
"""

from __future__ import print_function

import io
import sys
import gzip
from sets import Set

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
  [page_id, page_title, _] = line.rstrip('\n').split('\t')
  ALL_PAGE_IDS.add(page_id)
  PAGE_TITLES_TO_IDS[page_title] = page_id

# Create a dictionary of redirects, replace page titles in the redirects file with their
# corresponding IDs and ignoring pages which do not exist.
REDIRECTS = {}
for line in io.BufferedReader(gzip.open(REDIRECTS_FILE, 'r')):
  [from_page_id, to_page_title] = line.rstrip('\n').split('\t')

  from_page_exists = from_page_id in ALL_PAGE_IDS
  to_page_id = PAGE_TITLES_TO_IDS.get(to_page_title)

  if from_page_exists and to_page_id is not None:
    REDIRECTS[from_page_id] = to_page_id

# Loop through the redirects dictionary and remove redirects which redirect to another redirect,
# writing the remaining redirects to stdout.
for from_page_id, to_page_id in REDIRECTS.iteritems():
  start_to_page_id = to_page_id
  while to_page_id in REDIRECTS:
    to_page_id = REDIRECTS[to_page_id]

    # Break out if there is a circular path, meaning the redirects only point to other redirects,
    # not an acutal page.
    if to_page_id == start_to_page_id:
      to_page_id = None

  if to_page_id is not None:
    print('\t'.join([from_page_id, to_page_id]))
