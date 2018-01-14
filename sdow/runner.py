import sys
import os.path
import sqlite3
import helpers
from breadth_first_search import breadth_first_search


if len(sys.argv) < 3 or len(sys.argv) > 5:
  # TODO: make verbose a -v or --verbose flag instead of an argument
  print '[ERROR] Invalid argument count'
  print '[INFO] Usage: sdow.py <sqlite_file> <start_page_name> <end_page_name> [<verbose>]'
  sys.exit(1)

sqlite_file = sys.argv[1]

if not os.path.isfile(sqlite_file):
  print '[ERROR] Specified SQLite file "{0}" does not exist.'.format(sqlite_file)
  sys.exit(1)

conn = sqlite3.connect(sqlite_file)
cursor = conn.cursor()

start_page_id = helpers.fetch_page_id_from_page_name(sys.argv[2], cursor)
end_page_id = helpers.fetch_page_id_from_page_name(sys.argv[3], cursor)

verbose = (len(sys.argv) == 5)

paths = breadth_first_search(start_page_id, end_page_id, cursor, verbose)

for i, path in enumerate(paths):
  print '{0}:'.format(i),
  for j, page_id in enumerate(path):
    cursor.execute('SELECT name FROM pages WHERE id={0}'.format(page_id))
    name = cursor.fetchone()[0]
    if j == len(path) - 1:
      print name
    else:
      print '{0} =>'.format(name.encode('utf-8')),
