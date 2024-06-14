import os
import sqlite3
import subprocess
from collections import defaultdict

cwd = os.path.dirname(__file__)
mock_sdow_database_filename = os.path.join(cwd, '../sdow/sdow.sqlite')
mock_searches_database_filename = os.path.join(cwd, '../sdow/searches.sqlite')
searches_database_sql_filename = os.path.join(cwd, '../sql/createSearchesTable.sql')

print('[INFO] Creating mock SDOW database: {0}'.format(mock_sdow_database_filename))

conn = sqlite3.connect(mock_sdow_database_filename)


# Create pages table.
conn.execute('DROP TABLE IF EXISTS pages')
conn.execute('CREATE TABLE pages(id INTEGER PRIMARY KEY, title TEXT, is_redirect INT)')

prod_page_ids = {
    1: '22770',
    2: '64516',
    3: '208157',
    4: '208161',
    5: '6412297',
    6: '208171',
    7: '208159',
    8: '208174',
    9: '173457',
    10: '208151',
    11: '208156',
    12: '208155',
    13: '37231',
    14: '19223527',
    15: '208252',
    16: '208254',
    17: '208288',
    18: '208294',
    19: '208292',
    20: '208259',
    21: '209248',
    22: '362193',
    23: '362203',
    24: '362201',
    25: '362204',
    26: '362205',
    27: '369235',
    28: '362213',
    29: '362212',
    # Redirects
    30: '341668',
    31: '392390',
    32: '391918',
    33: '305606',
    34: '391919',
    35: '379525',
}

for i in range(1, 36):
  if i <= 10:
    page_name = '{0}'.format(i)
  else:
    page_name = '{0}_(number)'.format(i)

  is_redirect = 0 if i < 30 else 1

  conn.execute('INSERT INTO pages VALUES ({0}, "{1}", {2});'.format(
      prod_page_ids[i], page_name, is_redirect))


# Create redirects table.
conn.execute('DROP TABLE IF EXISTS redirects')
conn.execute(
    'CREATE TABLE redirects(source_id INTEGER PRIMARY KEY, target_id INTEGER NOT NULL)')

for i in range(30, 35):
  conn.execute('INSERT INTO redirects VALUES ({0}, {1});'.format(
      prod_page_ids[i], prod_page_ids[1]))


# Create links table.
conn.execute('DROP TABLE IF EXISTS links')
conn.execute(
    'CREATE TABLE links(id INTEGER PRIMARY KEY, outgoing_links_count INTEGER, incoming_links_count INTEGER, outgoing_links TEXT, incoming_links TEXT);')

forward_links = [
    (1, [2, 4, 5, 10]),
    (2, [1, 3, 10]),
    (3, [4, 11]),
    (4, [1, 6, 9]),
    (5, [6]),
    (6, []),
    (7, [8]),
    (8, [7]),
    (9, [3]),
    (10, []),
    (11, [12]),
    (12, []),
    (13, [12]),
    (14, []),
    (15, [16, 17]),
    (16, [17, 18]),
    (17, [18]),
    (18, [19]),
    (19, [20]),
    (20, []),
]

backward_links = defaultdict(list)
for source_page_id, outgoing_links in forward_links:
  for target_page_id in outgoing_links:
    backward_links[target_page_id].append(source_page_id)

for page_id, outgoing_links in forward_links:
  incoming_links = backward_links[page_id]

  outgoing_links_count = len(outgoing_links)
  incoming_links_count = len(incoming_links)

  outgoing_links = [prod_page_ids[i] for i in outgoing_links]
  outgoing_links = '|'.join(outgoing_links)

  incoming_links = [prod_page_ids[i] for i in incoming_links]
  incoming_links = '|'.join(incoming_links)

  conn.execute('INSERT INTO links VALUES ({0}, {1}, {2}, "{3}", "{4}");'.format(
      prod_page_ids[page_id], outgoing_links_count, incoming_links_count, outgoing_links, incoming_links))

conn.commit()

print('[INFO] Successfully created mock SDOW database: {0}'.format(mock_sdow_database_filename))


print('[INFO] Creating mock searches database: {0}'.format(mock_searches_database_filename))

conn = sqlite3.connect(mock_searches_database_filename)

# Create searches table.
subprocess.call('sqlite3 {0} ".read {1}"'.format(
    mock_searches_database_filename, searches_database_sql_filename), shell=True)
# conn.execute('DROP TABLE IF EXISTS searches')
# conn.execute('CREATE TABLE IF NOT EXISTS searches(source_id INTEGER NOT NULL, target_id INTEGER NOT NULL, duration REAL NOT NULL, degrees_count INTEGER, paths_count INTEGER NOT NULL, t TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL);')

print('[INFO] Successfully created mock searches database: {0}'.format(
    mock_searches_database_filename))
