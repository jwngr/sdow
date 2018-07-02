"""
Runs the database queries used to generate the Wikipedia facts JSON file.
"""

from __future__ import print_function

import os
import sqlite3

sdow_database = './dump/sdow.sqlite'
if not os.path.isfile(sdow_database):
  raise IOError('Specified SQLite file "{0}" does not exist.'.format(sdow_database))

conn = sqlite3.connect(sdow_database)
cursor = conn.cursor()
cursor.arraysize = 1000

queries = {
  'Non-redirect pages count': '''
    SELECT COUNT(*)
    FROM pages
    WHERE is_redirect = 0;
  ''',
  'Links count': '''
    SELECT SUM(outgoing_links_count)
    FROM links;
  ''',
  'Redirects count': '''
    SELECT COUNT(*)
    FROM redirects;
  ''',
  'Pages with most outgoing links': '''
    SELECT title, outgoing_links_count
    FROM links
    INNER JOIN pages ON links.id = pages.id
    ORDER BY links.outgoing_links_count DESC
    LIMIT 5;
  ''',
  'Pages with most incoming links': '''
    SELECT title, incoming_links_count
    FROM links
    INNER JOIN pages ON links.id = pages.id
    ORDER BY links.incoming_links_count DESC
    LIMIT 5;
  ''',
  'First articles sorted alphabetically': '''
    SELECT title
    FROM pages
    WHERE is_redirect = 0
    ORDER BY title ASC
    LIMIT 5;
  ''',
  'Last articles sorted alphabetically': '''
    SELECT title
    FROM pages
    WHERE is_redirect = 0
    ORDER BY title DESC
    LIMIT 5;
  ''',
  'Pages with no incoming or outgoing links (ALSO USED IN THE FOLLOWING TWO QUERIES)': '''
    SELECT COUNT(*)
    FROM pages
    LEFT JOIN links ON pages.id = links.id
    WHERE is_redirect = 0
      AND links.id IS NULL;
  ''',
  'Pages with no outgoing links (ADD TO THE QUERY ABOVE)': '''
    SELECT COUNT(*)
    FROM links
    WHERE outgoing_links_count = 0;
  ''',
  'Pages with no incoming links (ADD TO THE QUERY TWO ABOVE)': '''
    SELECT COUNT(*)
    FROM links
    WHERE incoming_links_count = 0;
  ''',
  'Pages with the longest titles': '''
    SELECT title, LENGTH(title)
    FROM pages
    WHERE is_redirect = 0
    ORDER BY LENGTH(title) DESC
    LIMIT 10;
  ''',
  'Number of pages with a single character title': '''
    SELECT COUNT(*)
    FROM pages
    WHERE is_redirect = 0
      AND LENGTH(title) = 1;
  ''',
  'Number of page titles which start with an exclamation mark': '''
    SELECT COUNT(*)
    FROM pages
    WHERE is_redirect = 0
      AND title LIKE '!%';
  ''',
  'Number of page titles containing an exclamation mark': '''
    SELECT COUNT(*)
    FROM pages
    WHERE is_redirect = 0
      AND INSTR(title, '!') > 0;
  ''',
  'Number of page titles which start with a question mark': '''
    SELECT COUNT(*)
    FROM pages
    WHERE is_redirect = 0
      AND title LIKE '?%';
  ''',
  'Number of page titles containing a question mark': '''
    SELECT COUNT(*)
    FROM pages
    WHERE is_redirect = 0
      AND INSTR(title, '?') > 0;
  ''',
  'Number of page titles containing a space': '''
    SELECT COUNT(*)
    FROM pages
    WHERE is_redirect = 0
      AND INSTR(title, '_') > 0;
  ''',
  'Number of page titles not containing a space': '''
    SELECT COUNT(*)
    FROM pages
    WHERE is_redirect = 0
      AND INSTR(title, '_') = 0;
  ''',
  'Number of page titles containing either a single or double quotation mark': '''
    SELECT COUNT(*)
    FROM pages
    WHERE is_redirect = 0
      AND (INSTR(title, '"') > 0
           OR INSTR(title, "'") > 0);
  ''',
  'Longest page titles not containing a space': '''
    SELECT title, LENGTH(title)
    FROM pages
    WHERE is_redirect = 0
      AND INSTR(title, '_') = 0
    ORDER BY LENGTH(title) DESC
    LIMIT 10;
  ''',
}

for key, query in queries.items():
  cursor.execute(query)
  print('{0}:'.format(key))
  for result in cursor.fetchall():
    for token in result:
      if not isinstance(token, (int, long)):
        token = token.encode('utf-8').replace('_', ' ')
      print(token, ' ', end='')
    print()
  print()
