"""
Replaces page names in the links file with their corresponding IDs, eliminates links containing
non-existing pages, and replaces redirects with the pages to which they redirect.

Output is written to stdout.
"""

import io
import sys
import gzip

# Validate inputs
if len(sys.argv) < 4:
  print('[ERROR] Not enough arguments provided!')
  print('[INFO] Usage: {0} <pages_file> <redirects_file> <targets_file>'.format(sys.argv[0]))
  sys.exit()

PAGES_FILE = sys.argv[1]
REDIRECTS_FILE = sys.argv[2]
TARGETS_FILE = sys.argv[3]

if not PAGES_FILE.endswith('.gz'):
  print('[ERROR] Pages file must be gzipped.')
  sys.exit()

if not REDIRECTS_FILE.endswith('.gz'):
  print('[ERROR] Redirects file must be gzipped.')
  sys.exit()

if not TARGETS_FILE.endswith('.gz'):
  print('[ERROR] Targets file must be gzipped.')
  sys.exit()

# Create a set of all page IDs and a dictionary of page titles to their corresponding IDs.
ALL_PAGE_IDS = set()
PAGE_TITLES_TO_IDS = {}
for line in io.BufferedReader(gzip.open(PAGES_FILE, 'rb')):
  [page_id, page_title, _] = line.rstrip(b'\n').split(b'\t')
  ALL_PAGE_IDS.add(page_id)
  PAGE_TITLES_TO_IDS[page_title] = page_id

# Create a dictionary of page IDs to the target page ID to which they redirect.
REDIRECTS = {}
for line in io.BufferedReader(gzip.open(REDIRECTS_FILE, 'rb')):
  [source_page_id, target_page_id] = line.rstrip(b'\n').split(b'\t')
  REDIRECTS[source_page_id] = target_page_id

# Loop through each line in the links file, replacing titles with IDs, applying redirects, and
# removing nonexistent pages, writing the result to stdout.
for line in io.BufferedReader(gzip.open(TARGETS_FILE, 'rb')):
  [target_id, target_page_title] = line.rstrip(b'\n').split(b'\t')

  target_page_id = PAGE_TITLES_TO_IDS.get(target_page_title)

  if target_page_id is not None:
    target_page_id = REDIRECTS.get(target_page_id, target_page_id)
    print(b'\t'.join([target_id, target_page_id]).decode())
  else:
    pass


