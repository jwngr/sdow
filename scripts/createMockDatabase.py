import sqlite3

mock_database_filename = 'sdow.sqlite'

print '[INFO] Creating mock database: {0}'.format(mock_database_filename)

conn = sqlite3.connect(mock_database_filename)

conn.execute('DROP TABLE IF EXISTS pages')
conn.execute('CREATE TABLE pages(id INTEGER PRIMARY KEY, name TEXT)')

for page_id in range(1, 101):
  page_name = '{0}_{1}'.format(page_id, page_id)
  conn.execute('INSERT INTO pages VALUES ({0}, "{1}")'.format(page_id, page_name))

conn.execute('DROP TABLE IF EXISTS redirects')
conn.execute('CREATE TABLE redirects(from_id INTEGER PRIMARY KEY, to_id INTEGER)')

for page_id in range(50, 60):
  conn.execute('INSERT INTO redirects VALUES ({0}, {1})'.format(page_id, page_id + 10))

conn.execute('DROP TABLE IF EXISTS links')
conn.execute('CREATE TABLE links(from_id INTEGER, to_id INTEGER, PRIMARY KEY (from_id, to_id)) WITHOUT ROWID;')

conn.execute('INSERT INTO links VALUES (1, 2)')
conn.execute('INSERT INTO links VALUES (1, 4)')
conn.execute('INSERT INTO links VALUES (1, 5)')
conn.execute('INSERT INTO links VALUES (1, 10)')
conn.execute('INSERT INTO links VALUES (2, 1)')
conn.execute('INSERT INTO links VALUES (2, 3)')
conn.execute('INSERT INTO links VALUES (2, 10)')
conn.execute('INSERT INTO links VALUES (3, 4)')
conn.execute('INSERT INTO links VALUES (3, 11)')
conn.execute('INSERT INTO links VALUES (4, 1)')
conn.execute('INSERT INTO links VALUES (4, 6)')
conn.execute('INSERT INTO links VALUES (4, 9)')
conn.execute('INSERT INTO links VALUES (5, 6)')
conn.execute('INSERT INTO links VALUES (7, 8)')
conn.execute('INSERT INTO links VALUES (8, 7)')
conn.execute('INSERT INTO links VALUES (9, 3)')
conn.execute('INSERT INTO links VALUES (11, 12)')
conn.execute('INSERT INTO links VALUES (13, 12)')
conn.execute('INSERT INTO links VALUES (15, 16)')
conn.execute('INSERT INTO links VALUES (15, 17)')
conn.execute('INSERT INTO links VALUES (16, 17)')
conn.execute('INSERT INTO links VALUES (16, 18)')
conn.execute('INSERT INTO links VALUES (17, 18)')
conn.execute('INSERT INTO links VALUES (18, 19)')
conn.execute('INSERT INTO links VALUES (19, 20)')
conn.execute('INSERT INTO links VALUES (21, 20)')
conn.execute('INSERT INTO links VALUES (22, 20)')

conn.commit()

print '[INFO] Successfully created mock database: {0}'.format(mock_database_filename)
