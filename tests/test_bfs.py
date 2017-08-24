"""Tests the bi-directional breadth-first search implementation."""

import sqlite3
from tests import testutils
from breadth_first_search import breadth_first_search


def create_mock_database():
  """Creates a mock database for use in the test suite."""
  conn = sqlite3.connect('mock.db')

  conn.execute('DROP TABLE IF EXISTS links')
  conn.execute('CREATE TABLE links(from_id INTEGER, to_id INTEGER)')

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

  return conn


mock_conn = create_mock_database()

def test_self():
  results = breadth_first_search(1, 1, mock_conn)
  testutils.assert_array_equals(results, [[1]])


def test_neighbors():
  results = breadth_first_search(1, 2, mock_conn)
  testutils.assert_array_equals(results, [[1, 2]])


def test_two_equal_length_paths():
  results = breadth_first_search(2, 4, mock_conn)
  testutils.assert_array_equals(results, [[2, 1, 4], [2, 3, 4]])


def test_two_non_equal_length_paths():
  results = breadth_first_search(1, 9, mock_conn)
  testutils.assert_array_equals(results, [[1, 4, 9]])

def test_long_path():
  results = breadth_first_search(1, 12, mock_conn)
  testutils.assert_array_equals(results, [[1, 2, 3, 11, 12]])


def test_sinkhole_paths():
  results = breadth_first_search(1, 10, mock_conn)
  testutils.assert_array_equals(results, [[1, 10]])

  results = breadth_first_search(2, 10, mock_conn)
  testutils.assert_array_equals(results, [[2, 10]])

  results = breadth_first_search(10, 1, mock_conn)
  testutils.assert_array_equals(results, [])

  results = breadth_first_search(10, 2, mock_conn)
  testutils.assert_array_equals(results, [])


def test_nonexistent_page():
  results = breadth_first_search(1, 999, mock_conn)
  testutils.assert_array_equals(results, [])


def test_island():
  results = breadth_first_search(7, 8, mock_conn)
  testutils.assert_array_equals(results, [[7, 8]])

  results = breadth_first_search(8, 7, mock_conn)
  testutils.assert_array_equals(results, [[8, 7]])

  results = breadth_first_search(1, 7, mock_conn)
  testutils.assert_array_equals(results, [])

  results = breadth_first_search(7, 1, mock_conn)
  testutils.assert_array_equals(results, [])

def test_reusing_node():
  results = breadth_first_search(15, 20, mock_conn)
  testutils.assert_array_equals(results, [[15, 16, 18, 19, 20], [15, 17, 18, 19, 20]])
