"""
Prunes the pages file by removing pages which are marked as redirects but have no corresponding
redirect in the redirects file.

Output is written to stdout.
"""

import io
import sys
import gzip

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

# Create a dictionary of redirects.
REDIRECTS = {}
for line in io.BufferedReader(gzip.open(REDIRECTS_FILE, 'rb')):
  [source_page_id, _] = line.rstrip(b'\n').split(b'\t')
  REDIRECTS[source_page_id] = True

# Loop through the pages file, ignoring pages which are marked as redirects but which do not have a
# corresponding redirect in the redirects dictionary, printing the remaining pages to stdout.
for line in io.BufferedReader(gzip.open(PAGES_FILE, 'rb')):
  [page_id, page_title, is_redirect] = line.rstrip(b'\n').split(b'\t')

  if True or is_redirect == '0' or page_id in REDIRECTS:
    print(b'\t'.join([page_id, page_title, is_redirect]).decode())
