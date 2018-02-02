"""
TODO
"""

import io
import sys
import gzip

# Validate input arguments.
if len(sys.argv) < 4:
    print '[ERROR] Not enough arguments provided!'
    print '[INFO] Usage: {0} <pages_file> <redirects_file> <from_links_file> <to_links_file>'.format(sys.argv[0])
    sys.exit()

pages_file = sys.argv[1]
redirects_file = sys.argv[2]
from_links_file = sys.argv[3]
to_links_file = sys.argv[4]

if not pages_file.endswith('.gz'):
    print '[ERROR] Pages file must be gzipped.'
    sys.exit()

if not redirects_file.endswith('.gz'):
    print '[ERROR] Redirects file must be gzipped.'
    sys.exit()

if not to_links_file.endswith('.gz'):
    print '[ERROR] To links file must be gzipped.'
    sys.exit()

if not from_links_file.endswith('.gz'):
    print '[ERROR] From links file must be gzipped.'
    sys.exit()

# Create a dictionary from page ID to the ID of the page to which it redirects.
redirects_dict = {}
for line in io.BufferedReader(gzip.open(redirects_file, 'r')):
    [from_page_id, to_page_id] = line.rstrip('\n').split('\t')
    redirects_dict[from_page_id] = to_page_id

# Create a dictionary from page ID to a list of pages to which it links.
from_links_dict = {}
for line in io.BufferedReader(gzip.open(from_links_file, 'r')):
    [from_page_id, to_page_ids] = line.rstrip('\n').split('\t')
    from_links_dict[from_page_id] = to_page_ids

# Create a dictionary from page ID to a list of pages whic link to it.
to_links_dict = {}
for line in io.BufferedReader(gzip.open(to_links_file, 'r')):
    [to_page_id, from_page_ids] = line.rstrip('\n').split('\t')
    to_links_dict[to_page_id] = from_page_ids

# Print out all details for each page in the pages file.
for line in io.BufferedReader(gzip.open(pages_file, 'r')):
    [page_id, page_title] = line.rstrip('\n').split('\t')
    redirected_id = redirects_dict.get(page_id)

    if redirected_id is not None:
        columns = [page_id, page_title, redirected_id, '', '', '']
    else:
        to_links = to_links_dict.get(page_id, '')
        from_links = from_links_dict.get(page_id, '')
        columns = [page_id, page_title, '', str(
            len(from_links)), to_links, from_links]

    print '\t'.join(columns)
