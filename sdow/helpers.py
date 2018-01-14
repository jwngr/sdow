def is_str(s):
  try:
    return isinstance(s, basestring)
  except NameError:
    return isinstance(s, str)

def fetch_page_id(page_name, cursor):
  '''
  Returns the page ID corresponding to the provided page name.

  Args:
    page_name: The page name whose ID to fetch.

  Returns:
    int: The page ID corresponding to the provided page name.

  Raises:
    ValueError: If the provided page name is invalid or does not exist.
  '''
  print 'TESTING'

  if not page_name or not is_str(page_name):
    raise ValueError((
      'Invalid page name "{0}" provided. Page name must be a non-empty string.'.format(page_name)
    ))

  sanitized_page_name = page_name.replace(' ', '_')

  print 'sanitized_page_name: {0}'.format(sanitized_page_name)

  query = 'SELECT id FROM pages WHERE name="{0}"'.format(sanitized_page_name)
  cursor.execute(query)

  page_id = cursor.fetchone()

  if not page_id:
    raise ValueError('Invalid page name {0} provided. Page name does not exist.'.format(page_name))

  return page_id[0]


def fetch_page_name(page_id, cursor):
  '''
  Returns the page name corresponding to the provided page ID.

  Args:
    page_id: The page ID whose ID to fetch.

  Returns:
    str: The page name corresponding to the provided page ID.

  Raises:
    ValueError: If the provided page ID is invalid or does not exist.
  '''
  if not page_id or not isinstance(page_id, int) or page_id < 1:
    raise ValueError((
      'Invalid page ID "{0}" provided. Page ID must be a positive integer.'.format(page_id)
    ))

  query = 'SELECT name FROM pages WHERE id="{0}"'.format(page_id)
  cursor.execute(query)

  page_name = cursor.fetchone()

  if not page_name:
    raise ValueError('Invalid page ID "{0}" provided. Page ID does not exist.'.format(page_id))

  return page_name[0].encode('utf-8').replace('_', ' ')


def fetch_redirected_page_id(from_page_id, cursor):
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
  if not from_page_id or not isinstance(from_page_id, int) or from_page_id < 1:
    raise ValueError((
      'Invalid page ID "{0}" provided. Page ID must be a positive integer.'.format(from_page_id)
    ))

  query = 'SELECT to_id FROM redirects WHERE from_id="{0}"'.format(from_page_id)
  cursor.execute(query)

  to_page_id = cursor.fetchone()

  return to_page_id and to_page_id[0]


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
