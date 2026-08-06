"""
Replaces page names in the links file with their corresponding IDs, eliminates links containing
non-existing pages, and replaces redirects with the pages to which they redirect.

Output is written to stdout.
"""

import io
import sys
import gzip

# Validate inputs
if len(sys.argv) < 5:
  print('[ERROR] Not enough arguments provided!')
  print('[INFO] Usage: {0} <pages_file> <redirects_file> <target_file> <links_file>'.format(sys.argv[0]))
  sys.exit()

PAGES_FILE = sys.argv[1]
REDIRECTS_FILE = sys.argv[2]
TARGETS_FILE = sys.argv[3]
LINKS_FILE = sys.argv[4]

if not PAGES_FILE.endswith('.gz'):
  print('[ERROR] Pages file must be gzipped.')
  sys.exit()

if not REDIRECTS_FILE.endswith('.gz'):
  print('[ERROR] Redirects file must be gzipped.')
  sys.exit()

if not TARGETS_FILE.endswith('.gz'):
  print('[ERROR] Targets file must be gzipped.')
  sys.exit()

if not LINKS_FILE.endswith('.gz'):
  print('[ERROR] Links file must be gzipped.')
  sys.exit()

# Create a set of all page IDs and a dictionary of page titles to their corresponding IDs.
ALL_PAGE_IDS = set()
for line in io.BufferedReader(gzip.open(PAGES_FILE, 'rb')):
  [page_id, page_title, _] = line.rstrip(b'\n').split(b'\t')
  ALL_PAGE_IDS.add(page_id)

# Create a dictionary of page IDs to the target page ID to which they redirect.
REDIRECTS = {}
for line in io.BufferedReader(gzip.open(REDIRECTS_FILE, 'rb')):
  [source_page_id, target_page_id] = line.rstrip(b'\n').split(b'\t')
  REDIRECTS[source_page_id] = target_page_id

# Create a dictionary of linktarget IDs to the target page ID
TARGETS = {}
for line in io.BufferedReader(gzip.open(TARGETS_FILE, 'rb')):
  [target_id, target_page_id] = line.rstrip(b'\n').split(b'\t')
  TARGETS[target_id] = target_page_id

# Loop through each line in the links file, replacing titles with IDs, applying redirects, and
# removing nonexistent pages, writing the result to stdout.
for line in io.BufferedReader(gzip.open(LINKS_FILE, 'rb')):
  [source_page_id, target_id] = line.rstrip(b'\n').split(b'\t')

  source_page_exists = source_page_id in ALL_PAGE_IDS

  if source_page_exists:
    source_page_id = REDIRECTS.get(source_page_id, source_page_id)

    target_page_id = TARGETS.get(target_id)
    if target_page_id is not None and source_page_id != target_page_id:
      target_page_id = REDIRECTS.get(target_page_id, target_page_id)
      print(b'\t'.join([source_page_id, target_page_id]).decode())
    else:
      pass

