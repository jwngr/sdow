'''
Helper classes and methods.
'''

def is_str(val):
  '''
  Returns whether or not the provided value is a string type.

  Args:
    val: The value to check.

  Returns:
    bool: Whether or not the provided value is a string type.
  '''
  try:
    return isinstance(val, basestring)
  except NameError:
    return isinstance(val, str)


def is_positive_int(val):
  '''
  Returns whether or not the provided value is a positive integer type.

  Args:
    val: The value to check.

  Returns:
    bool: Whether or not the provided value is a positive integer type.
  '''
  return val and isinstance(val, int) and val > 0



def validate_page_id(page_id):
  '''
  Validates the provided value is a valid page ID.

  Args:
    page_id: The page ID to validate.

  Returns:
    None

  Raises:
    ValueError: If the provided page ID is invalid.
  '''
  if not is_positive_int(page_id):
    raise ValueError((
      'Invalid page ID "{0}" provided. Page ID must be a positive integer.'.format(page_id)
    ))


def validate_page_name(page_name):
  '''
  Validates the provided value is a valid page name.

  Args:
    page_name: The page name to validate.

  Returns:
    None

  Raises:
    ValueError: If the provided page name is invalid.
  '''
  if not page_name or not is_str(page_name):
    raise ValueError((
      'Invalid page name "{0}" provided. Page name must be a non-empty string.'.format(page_name)
    ))

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


class InvalidRequest(Exception):
  '''
  Wrapper class for building invalid request error responses.
  '''
  status_code = 400

  def __init__(self, message, status_code=None, payload=None):
    Exception.__init__(self)
    self.message = message
    if status_code is not None:
      self.status_code = status_code
    self.payload = payload

  def to_dict(self):
    rv = dict(self.payload or ())
    rv['error'] = self.message
    return rv
