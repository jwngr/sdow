import sys
import sqlite3
from breadth_first_search import breadth_first_search

conn = sqlite3.connect('sdow-20180101.sqlite')

# TODO: make sure arg count is correct
start_id = int(sys.arv[1])
end_id = int(sys.arv[2])

verbose = True

results = breadth_first_search(start_id, end_id, conn, verbose)

# TODO: don't use a cursor, just pass conn itself
cursor = conn.cursor()
for i, result in enumerate(results):
  print '{0}:'.format(i),
  for j, page_id in enumerate(result):
    cursor.execute('SELECT name FROM pages WHERE id={0}'.format(page_id))
    name = cursor.fetchone()[0]
    if j == len(result) - 1:
      print name
    else:
      print '{0} =>'.format(name.encode('utf-8')),
