"""
Combines the incoming and outgoing links (as well as their counts) for each page.

Output is written to stdout.
"""

import io
import sys
import gzip
from collections import defaultdict

# Validate input arguments.
if len(sys.argv) < 2:
  print('[ERROR] Not enough arguments provided!')
  print('[INFO] Usage: {0} <outgoing_links_file> <incoming_links_file>'.format(sys.argv[0]))
  sys.exit()

OUTGOING_LINKS_FILE = sys.argv[1]
INCOMING_LINKS_FILE = sys.argv[2]

if not OUTGOING_LINKS_FILE.endswith('.gz'):
  print('[ERROR] Outgoing links file must be gzipped.')
  sys.exit()

if not INCOMING_LINKS_FILE.endswith('.gz'):
  print('[ERROR] Incoming links file must be gzipped.')
  sys.exit()

# Create a dictionary of page IDs to their incoming and outgoing links.
LINKS = defaultdict(lambda: defaultdict(str))
# outgoing is [0], incoming is [1]
for line in io.BufferedReader(gzip.open(OUTGOING_LINKS_FILE, 'rb')):
  [source_page_id, target_page_ids] = line.rstrip(b'\n').split(b'\t')
  LINKS[int(source_page_id)][0] = target_page_ids

for line in io.BufferedReader(gzip.open(INCOMING_LINKS_FILE, 'rb')):
  [target_page_id, source_page_ids] = line.rstrip(b'\n').split(b'\t')
  LINKS[int(target_page_id)][1] = source_page_ids

# For each page in the links dictionary, print out its incoming and outgoing links as well as their
# counts.
for page_id, links in LINKS.items():
  outgoing_links = links.get(0, b'')
  outgoing_links_count = 0 if outgoing_links==b'' else len(
      outgoing_links.split(b'|'))

  incoming_links = links.get(1, b'')
  incoming_links_count = 0 if incoming_links==b'' else len(
      incoming_links.split(b'|'))

  columns = [str(page_id).encode(), str(outgoing_links_count).encode(), str(
      incoming_links_count).encode(), outgoing_links, incoming_links]

  print(b'\t'.join(columns).decode())
