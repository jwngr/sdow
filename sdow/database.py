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

    self.conn = sqlite3.connect(sqlite_filename)
    self.cursor = self.conn.cursor()

    # TODO: measure the performance impact of this
    self.cursor.arraysize = 1000

  def __del__(self):
    self.conn.close()

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

    # TODO: handle page names which differ only in capitalization
    # See https://en.wikipedia.org/wiki/Wikipedia:Naming_conventions_(capitalization)#Page_names_that_differ_only_by_capitalization

    # TODO: consider adding COLLATE NOCASE to database definition
    # See https://stackoverflow.com/a/973785/2955366

    query = 'SELECT id FROM pages WHERE name = ? COLLATE NOCASE;'
    query_bindings = (sanitized_page_name,)
    self.cursor.execute(query, query_bindings)


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

    query = 'SELECT name FROM pages WHERE id = ?;'
    query_bindings = (page_id,)
    self.cursor.execute(query, query_bindings)

    page_name = self.cursor.fetchone()

    if not page_name:
      raise ValueError('Invalid page ID "{0}" provided. Page ID does not exist.'.format(page_id))

    # TODO: test this with special pages like https://en.wikipedia.org/wiki/Jos%C3%A9_Clavijo_y_Fajardo
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

    query = 'SELECT to_id FROM redirects WHERE from_id = ?'
    query_bindings = (from_page_id,)
    self.cursor.execute(query, query_bindings)

    to_page_id = self.cursor.fetchone()

    return to_page_id and to_page_id[0]

  def compute_shortest_paths(self, from_page_id, to_page_id):
    '''
    Returns a list of page IDs indicating the shortest path between the from and to page IDs.

    Args:
      from_page_id: The ID corresponding to the page at which to start the search.
      to_page_id: The ID corresponding to the page at which to end the search.

    Returns:
      [[int]]: A list of integer lists corresponding to the page IDs indicating the shortest path
               between the from and to page IDs.

    Raises:
      ValueError: If either of the provided page IDs are invalid.
    '''
    helpers.validate_page_id(from_page_id)
    helpers.validate_page_id(to_page_id)

    # TODO: handle pages which are redirects

    return breadth_first_search(from_page_id, to_page_id, self)

  def fetch_forwards_links(self, page_ids):
    '''
    Returns a list of tuples of page IDs representing forwards links from the list of provided page
    IDs to other pages.

    Args:
      page_ids: The page IDs whose forwards links to fetch.

    Returns:
      [(int, int)]: A lists of integer tuples representing forwards links from the list of provided
                    page IDs to other pages.
    '''
    return self.fetch_links_helper(page_ids, 'from_id')

  def fetch_backwards_links(self, page_ids):
    '''
    Returns a list of tuples of page IDs representing backwards links from the list of provided page
    IDs to other pages.

    Args:
      page_ids: The page IDs whose backwards links to fetch.

    Returns:
      [(int, int)]: A lists of integer tuples representing backwards links from the list of provided
                    page IDs to other pages.
    '''
    return self.fetch_links_helper(page_ids, 'to_id')

  def fetch_links_helper(self, page_ids, to_id_or_from_id):
    '''
    Helper function which handles duplicate logic for fetch_forwards_links() and
    fetch_backwards_links().

    Args:
      page_ids: The page IDs whose links to fetch.
      to_id_or_from_id: String which indicates whether to fetch forwards ("from_id") or backwards
                        ("to_id") links.

    Returns:
      [(int, int)]: A lists of integer tuples representing links from the list of provided page IDs
                    to other pages.
    '''
    #results = []
    #for row in self.cursor.execute(query):
    #  results.append(row)

    # TODO: measure the performance impact of this versus just appending to an array (above) or
    # just returning the cursor (not yet implemented)
    # There is no need to escape the query parameters here since they are never user-defined
    query = 'SELECT * FROM links WHERE {0} IN {1};'.format(to_id_or_from_id, page_ids)
    self.cursor.execute(query)

    return self.cursor.fetchall()

  def fetch_autocomplete_suggestions(self, search_query):
    '''
    Returns a list of the most relevant page names which contain the provided search query.

    Args:
      search_query: The search query whose autocomplete suggestions to fetch.

    Returns:
      [str]: A list of relevant page names.
    '''
    # TODO: to get the LIKE query below to use the index, I need to remove the leading %
    # See https://stackoverflow.com/questions/8584499/sqlite-should-like-searchstr-use-an-index
    modified_search_query = '%{0}%'.format(search_query.replace(' ', '_'))

    query = 'SELECT name FROM pages WHERE name LIKE ? LIMIT 2000;'
    # TODO: implement page popularity by counting incoming links
    # query = 'SELECT name FROM pages WHERE name LIKE ? ORDER BY popularity DESC LIMIT 10;'
    query_bindings = (modified_search_query,)
    self.cursor.execute(query, query_bindings)

    results = [result[0].replace('_', ' ') for result in self.cursor.fetchall()]

    return results
