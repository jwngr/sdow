"""
Replaces page titles in the redirects file with their corresponding IDs.

Output is written to stdout.
"""

import io
import sys
import gzip
from sets import Set

# Validate input arguments.
if (len(sys.argv) < 3):
    print '[ERROR] Not enough arguments provided!'
    print '[INFO] Usage: {0} <pages_file> <redirects_file>'.format(sys.argv[0])
    sys.exit()

pages_file = sys.argv[1]
redirects_file = sys.argv[2]

if not pages_file.endswith('.gz'):
    print '[ERROR] Pages file must be gzipped.'
    sys.exit()

if not redirects_file.endswith('.gz'):
    print '[ERROR] Redirects file must be gzipped.'
    sys.exit()

# Create a set of all page IDs and a dictionary of page titles to their corresponding IDs.
all_page_ids = Set()
page_titles_to_ids = {}
for line in io.BufferedReader(gzip.open(pages_file, 'r')):
    [page_id, page_title] = line.rstrip('\n').split('\t')
    all_page_ids.add(page_id)
    page_titles_to_ids[page_title] = page_id

# Replace each page title in the redirects file with its corresponding ID and write it to stdout.
for line in io.BufferedReader(gzip.open(redirects_file, 'r')):
    [from_page_id, to_page_title] = line.rstrip('\n').split('\t')

    from_page_exists = from_page_id in all_page_ids
    to_page_id = page_titles_to_ids.get(to_page_title)

    if (from_page_exists and to_page_id is not None):
        print '\t'.join([from_page_id, to_page_id])
