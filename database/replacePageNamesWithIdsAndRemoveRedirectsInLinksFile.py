"""
Replaces page names in the links file with their corresponding IDs, eliminates links containing
non-existing pages, and replaces redirects with the pages to which they redirect.

Output is written to stdout.
"""

import io
import sys
import gzip
from sets import Set

# Validate inputs
if (len(sys.argv) < 4):
  print '[ERROR] Not enough arguments provided!'
  print '[INFO] Usage: {0} <pages_file> <redirects_file> <links_file>'.format(sys.argv[0])
  sys.exit()

pages_file = sys.argv[1]
redirects_file = sys.argv[2]
links_file = sys.argv[3]

if (pages_file.endswith('.gz') == False):
  print '[ERROR] Pages file must be gzipped.'
  sys.exit()

if (redirects_file.endswith('.gz') == False):
  print '[ERROR] Redirects file must be gzipped.'
  sys.exit()

if (links_file.endswith('.gz') == False):
  print '[ERROR] Links file must be gzipped.'
  sys.exit()

# Create a dictionary of page names to IDs and a set of all page IDs
page_names_to_ids = {}
all_page_ids = Set()
for line in io.BufferedReader(gzip.open(pages_file, 'r')):
  [page_id, page_name] = line.rstrip('\n').split('\t')
  all_page_ids.add(page_id)
  page_names_to_ids[page_name] = page_id

# Create a dictionary from the source page's ID to the ID of the page to which it redirects
redirects = {}
for line in io.BufferedReader(gzip.open(redirects_file, 'r')):
  [from_page_id, to_page_id] = line.rstrip('\n').split('\t')
  redirects[from_page_id] = to_page_id

# Create a dictionary to hold each link which has already been written to stdout
written_links = {}

# Loop through each link, making sure both of its pages exist and replace any redirects it contains.
# writing the result to stdout
for line in io.BufferedReader(gzip.open(links_file, 'r')):
  [from_page_id, to_page_name] = line.rstrip('\n').split('\t')

  from_page_exists = from_page_id in all_page_ids
  to_page_exists = to_page_name in page_names_to_ids
  from_page_is_not_redirect = from_page_id not in redirects

  if (from_page_exists and to_page_exists and from_page_is_not_redirect):
    to_page_id = page_names_to_ids[to_page_name]

    # If the to page is a redirect, update it to the non-redirect page.
    if (to_page_id in redirects):
      to_page_id = redirects[to_page_id]

    # Since we are replacing redirects, it's possible we could have a duplicate link which was
    # already written.
    link_already_written = from_page_id in written_links and to_page_id in written_links[from_page_id]

    if not link_already_written:
      print '{0}\t{1}'.format(from_page_id, to_page_id)

      if from_page_id not in written_links:
        written_links[from_page_id] = Set()

      written_links[from_page_id].add(to_page_id)
