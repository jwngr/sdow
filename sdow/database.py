"""
Wrapper for reading from and writing to the SDOW database.
"""

import os.path
import sqlite3

import helpers as helpers
from breadth_first_search import breadth_first_search


class Database(object):
  """Wrapper for connecting to the SDOW database."""

  def __init__(self, sdow_database, searches_database):
    if not os.path.isfile(sdow_database):
      raise IOError('Specified SQLite file "{0}" does not exist.'.format(sdow_database))

    if not os.path.isfile(searches_database):
      raise IOError('Specified SQLite file "{0}" does not exist.'.format(searches_database))

    self.sdow_conn = sqlite3.connect(sdow_database, check_same_thread=False)
    self.searches_conn = sqlite3.connect(searches_database, check_same_thread=False)

    self.sdow_cursor = self.sdow_conn.cursor()
    self.searches_cursor = self.searches_conn.cursor()

    self.sdow_cursor.arraysize = 1000
    self.searches_cursor.arraysize = 1000

  def fetch_page(self, page_title):
    """Returns the ID and title of the non-redirect page corresponding to the provided title,
    handling titles with incorrect capitalization as well as redirects.

    Args:
      page_title: The title of the page to fetch.

    Returns:
      (int, str, bool): A tuple containing the page ID, title, and whether or not a redirect was
      followed.
      OR
      None: If no page exists.

    Raises:
      ValueError: If the provided page title is invalid.
    """
    sanitized_page_title = helpers.get_sanitized_page_title(page_title)

    query = 'SELECT * FROM pages WHERE title = ? COLLATE NOCASE;'
    query_bindings = (sanitized_page_title,)
    self.sdow_cursor.execute(query, query_bindings)

    # Because the above query is case-insensitive (due to the COLLATE NOCASE), multiple articles
    # can be matched.
    results = self.sdow_cursor.fetchall()

    if not results:
      raise ValueError(
          'Invalid page title {0} provided. Page title does not exist.'.format(page_title))

    # First, look for a non-redirect page which has exact match with the page title.
    for current_page_id, current_page_title, current_page_is_redirect in results:
      if current_page_title == sanitized_page_title and not current_page_is_redirect:
        return (current_page_id, helpers.get_readable_page_title(current_page_title), False)

    # Next, look for a match with a non-redirect page.
    for current_page_id, current_page_title, current_page_is_redirect in results:
      if not current_page_is_redirect:
        return (current_page_id, helpers.get_readable_page_title(current_page_title), False)

    # If all the results are redirects, use the page to which the first result redirects.
    query = 'SELECT target_id, title FROM redirects INNER JOIN pages ON pages.id = target_id WHERE source_id = ?;'
    query_bindings = (results[0][0],)
    self.sdow_cursor.execute(query, query_bindings)

    result = self.sdow_cursor.fetchone()

    # TODO: This will no longer be required once the April 2018 database dump occurs since this
    # scenario is prevented by the prune_pages_file.py Python script during the database creation.
    if not result:
      raise ValueError(
          'Invalid page title {0} provided. Page title does not exist.'.format(page_title))

    return (result[0], helpers.get_readable_page_title(result[1]), True)

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
    self.sdow_cursor.execute(query, query_bindings)

    page_title = self.sdow_cursor.fetchone()

    if not page_title:
      raise ValueError(
          'Invalid page ID "{0}" provided. Page ID does not exist.'.format(page_id))

    return page_title[0].replace('_', ' ')

  def compute_shortest_paths(self, source_page_id, target_page_id):
    """Returns a list of page IDs indicating the shortest path between the source and target pages.

    Note: the provided page IDs must correspond to non-redirect pages, but that check is not made
    for performance reasons.

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

    return breadth_first_search(source_page_id, target_page_id, self)

  def fetch_outgoing_links_count(self, page_ids):
    """Returns the sum of outgoing links of the provided page IDs.

    Args:
      page_ids: A list of page IDs whose outgoing links to count.

    Returns:
      int: The count of outgoing links.
    """
    return self.fetch_links_count_helper(page_ids, 'outgoing_links_count')

  def fetch_incoming_links_count(self, page_ids):
    """Returns the sum of incoming links for the provided page IDs.

    Args:
      page_ids: A list of page IDs whose incoming links to count.

    Returns:
      int: The count of incoming links.
    """
    return self.fetch_links_count_helper(page_ids, 'incoming_links_count')

  def fetch_links_count_helper(self, page_ids, incoming_or_outgoing_links_count):
    """Returns the sum of outgoing or incoming links for the provided page IDs.

    Args:
      page_ids: A list of page IDs whose outgoing or incoming links to count.

    Returns:
      int: The count of outgoing or incoming links.
    """
    page_ids = str(tuple(page_ids)).replace(',)', ')')

    # There is no need to escape the query parameters here since they are never user-defined.
    query = 'SELECT SUM({0}) FROM links WHERE id IN {1};'.format(
        incoming_or_outgoing_links_count, page_ids)
    self.sdow_cursor.execute(query)

    return self.sdow_cursor.fetchone()[0]

  def fetch_outgoing_links(self, page_ids):
    """Returns a list of tuples of page IDs representing outgoing links from the list of provided
    page IDs to other pages.

    Args:
      page_ids: A list of page IDs whose outgoing links to fetch.

    Returns:
      list(int, int): A lists of integer tuples representing outgoing links from the list of
        provided page IDs to other pages.
    """
    return self.fetch_links_helper(page_ids, 'outgoing_links')

  def fetch_incoming_links(self, page_ids):
    """Returns a list of tuples of page IDs representing incoming links from the list of provided
    page IDs to other pages.

    Args:
      page_ids: A list of page IDs whose incoming links to fetch.

    Returns:
      list(int, int): A lists of integer tuples representing incoming links from the list of
        provided page IDs to other pages.
    """
    return self.fetch_links_helper(page_ids, 'incoming_links')

  def fetch_links_helper(self, page_ids, outcoming_or_incoming_links):
    """Helper function which handles duplicate logic for fetch_outgoing_links() and
    fetch_incoming_links().

    Args:
      page_ids: A list of page IDs whose links to fetch.
      outcoming_or_incoming_links: String which indicates whether to fetch outgoing ("source_id") or
        incoming ("target_id") links.

    Returns:
      list(int, int): A cursor of a lists of integer tuples representing links from the list of
        provided page IDs to other pages.
    """
    # Convert the page IDs into a string surrounded by parentheses for insertion into the query
    # below. The replace() bit is some hackery to handle Python printing a trailing ',' when there
    # is only one key.
    page_ids = str(tuple(page_ids)).replace(',)', ')')

    # There is no need to escape the query parameters here since they are never user-defined.
    query = 'SELECT id, {0} FROM links WHERE id IN {1};'.format(
        outcoming_or_incoming_links, page_ids)
    self.sdow_cursor.execute(query)

    return self.sdow_cursor

  def insert_result(self, search):
    """Inserts a new search result into the searches table.

    Args:
      results: A dictionary containing search information.

    Returns: 
      None
    """
    paths_count = len(search['paths'])

    if paths_count == 0:
      degrees_count = 'NULL'
    else:
      degrees_count = len(search['paths'][0]) - 1

    # There is no need to escape the query parameters here since they are never user-defined.
    query = 'INSERT INTO searches VALUES ({source_id}, {target_id}, {duration}, {degrees_count}, {paths_count}, CURRENT_TIMESTAMP);'.format(
        source_id=search['source_id'],
        target_id=search['target_id'],
        duration=search['duration'],
        degrees_count=degrees_count,
        paths_count=paths_count,
    )
    self.searches_conn.execute(query)
    self.searches_conn.commit()
