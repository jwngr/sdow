'''
Wrapper for connecting to the SDOW database.
'''

import os.path
import sqlite3
import sdow.helpers as helpers
from sdow.breadth_first_search import breadth_first_search


class Database():
  '''
  Wrapper for connecting to the SDOW database.
  '''
  def __init__(self, sqlite_filename):
    if not os.path.isfile(sqlite_filename):
      raise IOError('Specified SQLite file "{0}" does not exist.'.format(sqlite_filename))

    conn = sqlite3.connect(sqlite_filename)
    self.cursor = conn.cursor()

  def fetch_page_id(self, page_name):
    '''
    Returns the page ID corresponding to the provided page name.

    Args:
      page_name: The page name whose ID to fetch.

    Returns:
      int: The page ID corresponding to the provided page name.

    Raises:
      ValueError: If the provided page name is invalid or does not exist.
    '''
    helpers.validate_page_name(page_name)

    sanitized_page_name = page_name.replace(' ', '_')

    print 'sanitized_page_name: {0}'.format(sanitized_page_name)

    query = 'SELECT id FROM pages WHERE name="{0}"'.format(sanitized_page_name)
    self.cursor.execute(query)

    page_id = self.cursor.fetchone()

    if not page_id:
      raise ValueError('Invalid page name {0} provided. Page name does not exist.'.format(page_name))

    return page_id[0]


  def fetch_page_name(self, page_id):
    '''
    Returns the page name corresponding to the provided page ID.

    Args:
      page_id: The page ID whose ID to fetch.

    Returns:
      str: The page name corresponding to the provided page ID.

    Raises:
      ValueError: If the provided page ID is invalid or does not exist.
    '''
    helpers.validate_page_id(page_id)

    query = 'SELECT name FROM pages WHERE id="{0}"'.format(page_id)
    self.cursor.execute(query)

    page_name = self.cursor.fetchone()

    if not page_name:
      raise ValueError('Invalid page ID "{0}" provided. Page ID does not exist.'.format(page_id))

    return page_name[0].encode('utf-8').replace('_', ' ')


  def fetch_redirected_page_id(self, from_page_id):
    '''
    If the provided page ID is a redirect, returns the ID of the page to which it redirects.
    Otherwise, returns None.

    Args:
      from_page_id: The page ID whose redirected page ID to fetch.

    Returns:
      int: The ID of the page to which the provided page ID redirects.
      OR
      None: If the provided page ID is not a redirect.

    Raises:
      ValueError: If the provided page ID is invalid.
    '''
    helpers.validate_page_id(from_page_id)

    query = 'SELECT to_id FROM redirects WHERE from_id="{0}"'.format(from_page_id)
    self.cursor.execute(query)

    to_page_id = self.cursor.fetchone()

    return to_page_id and to_page_id[0]

  def get_shortest_paths(self, from_page_id, to_page_id):
    '''
    Returns a list of page IDs indicating the shortest path between the from and to page IDs.

    Args:
      from_page_id: The ID corresponding to the page at which to start the search.
      to_page_id: The ID corresponding to the page at which to end the search.

    Returns:
      [[int]]: An lists of integer lists corresponding to the page IDs indicating the shortest path
      between the from and to page IDs.

    Raises:
      ValueError: If either of the provided page IDs are invalid.
      TODO: are there more errors this can raise?
    '''
    helpers.validate_page_id(from_page_id)
    helpers.validate_page_id(to_page_id)

    return breadth_first_search(from_page_id, to_page_id, self.cursor)


def run_forwards_links_query(keys_tuple, cursor):
  query = 'SELECT from_id, to_id FROM links WHERE from_id IN {0}'.format(keys_tuple)
  # TODO: clean up
  print query
  #results = []
  #for row in cursor.execute(query):
  #  results.append(row)
  cursor.arraysize = 1000
  cursor.execute(query)
  results = cursor.fetchall()
  print 'Length: {}'.format(len(results))
  return results


def run_backwards_links_query(keys_tuple, cursor):
  query = 'SELECT from_id, to_id FROM links WHERE to_id IN {0}'.format(keys_tuple)
  # TODO: clean up
  print query
  #results = []
  #for row in cursor.execute(query):
  #  results.append(row)
  cursor.arraysize = 1000
  cursor.execute(query)
  results = cursor.fetchall()
  print 'Length: {}'.format(len(results))
  return results
