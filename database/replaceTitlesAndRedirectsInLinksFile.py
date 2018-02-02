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
    print '[INFO] Usage: {0} <link_direction> <pages_file> <redirects_file> <links_file>'.format(sys.argv[0])
    sys.exit()

link_direction = sys.argv[1]
pages_file = sys.argv[2]
redirects_file = sys.argv[3]
links_file = sys.argv[4]

if (link_direction not in ['to', 'from']):
    print '[ERROR] Link direction must be "to" or "from".'
    sys.exit()

if (pages_file.endswith('.gz') == False):
    print '[ERROR] Pages file must be gzipped.'
    sys.exit()

if (redirects_file.endswith('.gz') == False):
    print '[ERROR] Redirects file must be gzipped.'
    sys.exit()

if (links_file.endswith('.gz') == False):
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
# removing nonexistent pages.
links = defaultdict(Set)
for line in io.BufferedReader(gzip.open(links_file, 'r')):
    if link_direction == 'from':
        [from_page_id, to_page_titles] = line.rstrip('\n').split('\t')

        from_page_exists = from_page_id in all_page_ids

        if from_page_exists:
            from_page_id = redirects.get(from_page_id, from_page_id)

            for to_page_title in to_page_titles.split('|'):
                to_page_id = page_titles_to_ids.get(to_page_title)

                if to_page_id is not None:
                    to_page_id = redirects.get(to_page_id, to_page_id)

                    links[from_page_id].add(to_page_id)
    else:
        [to_page_title, from_page_ids] = line.rstrip('\n').split('\t')

        to_page_id = page_titles_to_ids.get(to_page_title)
        to_page_id = redirects.get(to_page_id, to_page_id)

        if to_page_id is not None:
            for from_page_id in from_page_ids.split('|'):
                from_page_exists = from_page_id in all_page_ids

                if from_page_exists:
                    from_page_id = redirects.get(from_page_id, from_page_id)
                    links[to_page_id].add(from_page_id)

# Loop through each link and print it to stdout.
for page_id, linked_page_ids in links.iteritems():
    print '\t'.join([page_id, '|'.join(linked_page_ids)])
