"""
TODO
"""

import io
import sys
import gzip
from collections import defaultdict

# Validate input arguments.
if len(sys.argv) < 2:
    print '[ERROR] Not enough arguments provided!'
    print '[INFO] Usage: {0} <outgoing_links_file> <incoming_links_file>'.format(sys.argv[0])
    sys.exit()

outgoing_links_file = sys.argv[1]
incoming_links_file = sys.argv[2]

if not outgoing_links_file.endswith('.gz'):
    print '[ERROR] From links file must be gzipped.'
    sys.exit()

if not incoming_links_file.endswith('.gz'):
    print '[ERROR] To links file must be gzipped.'
    sys.exit()

# Create a dictionary from page ID to a string containing its incoming and outgoing links.
links_dict = defaultdict(lambda: defaultdict(str))
for line in io.BufferedReader(gzip.open(outgoing_links_file, 'r')):
    [from_page_id, to_page_ids] = line.rstrip('\n').split('\t')
    links_dict[from_page_id]['outgoing'] = to_page_ids

for line in io.BufferedReader(gzip.open(incoming_links_file, 'r')):
    [to_page_id, from_page_ids] = line.rstrip('\n').split('\t')
    links_dict[to_page_id]['incoming'] = from_page_ids

# For each page in the links dictionary, print out its incoming and outgoing links as well as their
# counts.
for page_id, links in links_dict.iteritems():
    outgoing_links = links.get('outgoing', '')
    outgoing_links_count = 0 if outgoing_links is '' else len(
        outgoing_links.split(','))

    incoming_links = links.get('incoming', '')
    incoming_links_count = 0 if incoming_links is '' else len(
        incoming_links.split(','))

    columns = [page_id, str(outgoing_links_count), str(
        incoming_links_count), outgoing_links, incoming_links]

    print '\t'.join(columns)
