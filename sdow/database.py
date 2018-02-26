"""
Wrapper for reading from and writing to the SDOW database.
"""

import os.path
import sqlite3
import helpers as helpers
from breadth_first_search import breadth_first_search


class Database(object):
  """Wrapper for connecting to the SDOW database."""

  def __init__(self, sqlite_filename):
    if not os.path.isfile(sqlite_filename):
      raise IOError('Specified SQLite file "{0}" does not exist.'.format(sqlite_filename))

    self.conn = sqlite3.connect(sqlite_filename)
    self.cursor = self.conn.cursor()

    # TODO: measure the performance impact of this
    self.cursor.arraysize = 1000

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
    self.cursor.execute(query, query_bindings)

    # Because the above query is case-insensitive (due to the COLLATE NOCASE), multiple articles
    # can be matched.
    results = self.cursor.fetchall()

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
    self.cursor.execute(query, query_bindings)

    result = self.cursor.fetchone()

    return (result[0], helpers.get_readable_page_title(result[1]), True)

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
      list(int, int): A lists of integer tuples representing links from the list of provided page
        IDs to other pages.
    """
    # Convert the page IDs into a string surrounded by parentheses for insertion into the query
    # below. The replace() bit is some hackery to handle Python printing a trailing ',' when there
    # is only one key.
    page_ids = str(tuple(page_ids)).replace(',)', ')')

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
      degrees_count = 'NULL'
      paths = str([])
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
