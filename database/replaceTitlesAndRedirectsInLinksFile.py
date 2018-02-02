"""
Replaces page names in the links file with their corresponding IDs, eliminates links containing
non-existing pages, and replaces redirects with the pages to which they redirect.

Output is written to stdout.
"""

import io
import sys
import gzip
from sets import Set
from collections import defaultdict

# Validate inputs
if (len(sys.argv) < 4):
    print '[ERROR] Not enough arguments provided!'
    print '[INFO] Usage: {0} <pages_file> <redirects_file> <links_file>'.format(sys.argv[0])
    sys.exit()

pages_file = sys.argv[1]
redirects_file = sys.argv[2]
links_file = sys.argv[3]

if not pages_file.endswith('.gz'):
    print '[ERROR] Pages file must be gzipped.'
    sys.exit()

if not redirects_file.endswith('.gz'):
    print '[ERROR] Redirects file must be gzipped.'
    sys.exit()

if not links_file.endswith('.gz'):
    print '[ERROR] Links file must be gzipped.'
    sys.exit()

# Create a set of all page IDs and a dictionary of page titles to their corresponding IDs.
all_page_ids = Set()
page_titles_to_ids = {}
for line in io.BufferedReader(gzip.open(pages_file, 'r')):
    [page_id, page_title] = line.rstrip('\n').split('\t')
    all_page_ids.add(page_id)
    page_titles_to_ids[page_title] = page_id

# Create a dictionary from page ID to the ID of the page to which it redirects.
redirects = {}
for line in io.BufferedReader(gzip.open(redirects_file, 'r')):
    [from_page_id, to_page_id] = line.rstrip('\n').split('\t')
    redirects[from_page_id] = to_page_id

# Loop through each line in the links file, replacing titles with IDs, applying redirects, and
# removing nonexistent pages, writing the result to stdout.
links = defaultdict(Set)
for line in io.BufferedReader(gzip.open(links_file, 'r')):
    [from_page_id, to_page_title] = line.rstrip('\n').split('\t')

    from_page_exists = from_page_id in all_page_ids

    if from_page_exists:
        from_page_id = redirects.get(from_page_id, from_page_id)

        to_page_id = page_titles_to_ids.get(to_page_title)

        if to_page_id is not None:
            to_page_id = redirects.get(to_page_id, to_page_id)
            print '\t'.join([from_page_id, to_page_id])
