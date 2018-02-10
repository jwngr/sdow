import sqlite3

mock_database_filename = 'sdow.sqlite'

print '[INFO] Creating mock database: {0}'.format(mock_database_filename)

conn = sqlite3.connect(mock_database_filename)

conn.execute('DROP TABLE IF EXISTS pages')
conn.execute('CREATE TABLE pages(id INTEGER PRIMARY KEY, name TEXT)')


page_ids = {
    1: 22770,
    2: 64516,
    3: 208157,
    4: 208161,
    5: 6412297,
    6: 208171,
    7: 208159,
    8: 208174,
    9: 173457,
    10: 208151,
    10: 53336456,
    11: 208156,
    12: 208155,
    13: 37231,
    14: 19223527,
    15: 208252,
    16: 208254,
    17: 208288,
    18: 208294,
    19: 208292,
    20: 208259,
    21: 209248,
    22: 362193,
    23: 362203,
    24: 362201,
    25: 362204,
    26: 362205,
    27: 369235,
    28: 362213,
    29: 362212,
    # Redirects
    30: 341668,
    31: 392390,
    32: 391918,
    33: 305606,
    34: 391919,
    35: 379525
}

for i in range(1, 36):
    if i <= 10:
        page_name = '{0}'.format(i)
    else:
        page_name = '{0}_(number)'.format(i)
    conn.execute('INSERT INTO pages VALUES ({0}, "{1}")'.format(
        page_ids[i], page_name))

conn.execute('DROP TABLE IF EXISTS redirects')
conn.execute(
    'CREATE TABLE redirects(from_id INTEGER PRIMARY KEY, to_id INTEGER)')

for i in range(30, 35):
    conn.execute('INSERT INTO redirects VALUES ({0}, {1})'.format(
        page_ids[i], page_ids[1]))

conn.execute('DROP TABLE IF EXISTS links')
conn.execute(
    'CREATE TABLE links(from_id INTEGER, to_id INTEGER, PRIMARY KEY (from_id, to_id)) WITHOUT ROWID;')

links = [
    (1, 2),
    (1, 4),
    (1, 5),
    (1, 10),
    (2, 1),
    (2, 3),
    (2, 10),
    (3, 4),
    (3, 11),
    (4, 1),
    (4, 6),
    (4, 9),
    (5, 6),
    (7, 8),
    (8, 7),
    (9, 3),
    (11, 12),
    (13, 12),
    (15, 16),
    (15, 17),
    (16, 17),
    (16, 18),
    (17, 18),
    (18, 19),
    (19, 20),
    (21, 20),
    (22, 20)
]

for from_id, to_id in links:
    conn.execute('INSERT INTO links VALUES ({0}, {1})'.format(
        page_ids[from_id], page_ids[to_id]))

conn.commit()

print '[INFO] Successfully created mock database: {0}'.format(mock_database_filename)
