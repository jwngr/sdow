"""
Wrapper for reading from and writing to the SDOW database.
"""

import os.path
import sqlite3
import sdow.helpers as helpers
from sdow.breadth_first_search import breadth_first_search


class Database(object):
  """Wrapper for connecting to the SDOW database."""

  def __init__(self, sqlite_filename):
    if not os.path.isfile(sqlite_filename):
      raise IOError('Specified SQLite file "{0}" does not exist.'.format(sqlite_filename))

    self.conn = sqlite3.connect(sqlite_filename)
    self.cursor = self.conn.cursor()

    # TODO: measure the performance impact of this
    self.cursor.arraysize = 1000

  def __del__(self):
    self.conn.close()

  def fetch_page_id(self, page_title):
    """Returns the page ID corresponding to the provided page title.

    Args:
      page_title: The title of the page whose ID to fetch.

    Returns:
      int: The page ID corresponding to the provided page title.

    Raises:
      ValueError: If the provided page title is invalid or does not exist.
    """
    sanitized_page_title = helpers.get_sanitize_page_title(page_title)

    query = 'SELECT * FROM pages WHERE title = ? COLLATE NOCASE;'
    query_bindings = (sanitized_page_title,)
    self.cursor.execute(query, query_bindings)

    # Because the above query is case-insensitive (due to the COLLATE NOCASE), multiple articles
    # can be matched.
    results = self.cursor.fetchall()

    if not results:
      raise ValueError(
          'Invalid page title {0} provided. Page title does not exist.'.format(page_title))

    # First, look for an exact match with the page title.
    for current_page_id, current_page_title, _ in results:
      if current_page_title == sanitized_page_title:
        return current_page_id

    # Next, look for a match with a non-redirect page.
    for current_page_id, _, current_page_is_redirect in results:
      if not current_page_is_redirect:
        return current_page_id

    # If all the results are redirects, just return the ID of the first result.
    return results[0].id

  def fetch_page_title(self, page_id):
    """Returns the page title corresponding to the provided page ID.

    Args:
      page_id: The page ID whose ID to fetch.

    Returns:
      str: The page title corresponding to the provided page ID.

    Raises:
      ValueError: If the provided page ID is invalid or does not exist.
    """
    helpers.validate_page_id(page_id)

    query = 'SELECT title FROM pages WHERE id = ?;'
    query_bindings = (page_id,)
    self.cursor.execute(query, query_bindings)

    page_title = self.cursor.fetchone()

    if not page_title:
      raise ValueError(
          'Invalid page ID "{0}" provided. Page ID does not exist.'.format(page_id))

    # TODO: test this with special pages like https://en.wikipedia.org/wiki/Jos%C3%A9_Clavijo_y_Fajardo
    return page_title[0].encode('utf-8').replace('_', ' ')

  def fetch_redirected_page_id(self, source_page_id):
    """If the provided page ID is a redirect, returns the ID of the page to which it redirects.
    Otherwise, returns None.

    Args:
      source_page_id: The page ID whose redirected page ID to fetch.

    Returns:
      int: The ID of the page to which the provided page ID redirects.
      OR
      None: If the provided page ID is not a redirect.

    Raises:
      ValueError: If the provided page ID is invalid.
    """
    helpers.validate_page_id(source_page_id)

    query = 'SELECT target_id FROM redirects WHERE source_id = ?'
    query_bindings = (source_page_id,)
    self.cursor.execute(query, query_bindings)

    target_page_id = self.cursor.fetchone()

    return target_page_id and target_page_id[0]

  def compute_shortest_paths(self, source_page_id, target_page_id):
    """Returns a list of page IDs indicating the shortest path between the source and target pages.

    Args:
      source_page_id: The ID corresponding to the page at which to start the search.
      target_page_id: The ID corresponding to the page at which to end the search.

    Returns:
      list(list(int)): A list of integer lists corresponding to the page IDs indicating the shortest path
        between the source and target page IDs.

    Raises:
      ValueError: If either of the provided page IDs are invalid.
    """
    helpers.validate_page_id(source_page_id)
    helpers.validate_page_id(target_page_id)

    # TODO: handle pages which are redirects

    return breadth_first_search(source_page_id, target_page_id, self)

  def fetch_outgoing_links(self, page_ids):
    """Returns a list of tuples of page IDs representing outgoing links from the list of provided
    page IDs to other pages.

    Args:
      page_ids: The page IDs whose outgoing links to fetch.

    Returns:
      list(int, int): A lists of integer tuples representing outgoing links from the list of
        provided page IDs to other pages.
    """
    return self.fetch_links_helper(page_ids, 'outgoing_links')

  def fetch_incoming_links(self, page_ids):
    """Returns a list of tuples of page IDs representing incoming links from the list of provided
    page IDs to other pages.

    Args:
      page_ids: The page IDs whose incoming links to fetch.

    Returns:
      list(int, int): A lists of integer tuples representing incoming links from the list of
        provided page IDs to other pages.
    """
    return self.fetch_links_helper(page_ids, 'incoming_links')

  def fetch_links_helper(self, page_ids, outcoming_or_incoming_links):
    """Helper function which handles duplicate logic for fetch_outgoing_links() and
    fetch_incoming_links().

    Args:
      page_ids: The page IDs whose links to fetch.
      outcoming_or_incoming_links: String which indicates whether to fetch outgoing ("source_id") or
        incoming ("target_id") links.

    Returns:
      list(int, int): A lists of integer tuples representing links from the list of provided page
        IDs to other pages.
    """
    # results = []
    # for row in self.cursor.execute(query):
    #  results.append(row)

    # TODO: measure the performance impact of this versus just appending to an array (above) or
    # just returning the cursor (not yet implemented)
    # There is no need to escape the query parameters here since they are never user-defined.
    query = 'SELECT id, {0} FROM links WHERE id IN {1};'.format(
        outcoming_or_incoming_links, page_ids)
    self.cursor.execute(query)

    return self.cursor.fetchall()

  def insert_result(self, search):
    """Inserts a new search result into the searches table.

    Args:
      results: A dictionary containing search information.

    Returns: 
      None
    """
    paths_count = len(search['paths'])

    if paths_count == 0:
      degrees_count = None
      paths = None
    else:
      degrees_count = len(search['paths'][0]) - 1
      paths = str(search['paths']).replace(' ', '')

    # There is no need to escape the query parameters here since they are never user-defined.
    query = 'INSERT INTO searches VALUES ({source_id}, {target_id}, {duration}, {degrees_count}, {paths_count}, "{paths}", CURRENT_TIMESTAMP);'.format(
        source_id=search['source_id'],
        target_id=search['target_id'],
        duration=search['duration'],
        degrees_count=degrees_count,
        paths_count=paths_count,
        paths=paths
    )
    self.conn.execute(query)
    self.conn.commit()
