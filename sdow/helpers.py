"""
Helper classes and methods.
"""


def get_sanitize_page_title(page_title):
  """Validates and returns the sanitized version of the provided page title, transforming it into
  the same format used to store pages titles in the database.

  Args:
    page_title: The page title to validate and sanitize.

  Returns:
    The sanitized page title.

  Examples:
    "Notre Dame Fighting Irish"   =>   "Notre_Dame_Fighting_Irish"
    "Farmers' market"             =>   "Farmers\'_market"
    "3.5" Floppy disk"            =>   "3.5\"_Floppy_disk"
    "Nip/Tuck"                    =>   "Nip\\Tuck"

  Raises:
    ValueError: If the provided page title is invalid.
  """
  validate_page_title(page_title)

  return page_title.replace(' ', '_').replace("'", "\\'").replace('"', '\\"')


def is_str(val):
  """Returns whether or not the provided value is a string type.

  Args:
    val: The value to check.

  Returns:
    bool: Whether or not the provided value is a string type.
  """
  try:
    return isinstance(val, basestring)
  except NameError:
    return isinstance(val, str)


def is_positive_int(val):
  """Returns whether or not the provided value is a positive integer type.

  Args:
    val: The value to check.

  Returns:
    bool: Whether or not the provided value is a positive integer type.
  """
  return val and isinstance(val, int) and val > 0


def validate_page_id(page_id):
  """Validates the provided value is a valid page ID.

  Args:
    page_id: The page ID to validate.

  Returns:
    None

  Raises:
    ValueError: If the provided page ID is invalid.
  """
  if not is_positive_int(page_id):
    raise ValueError((
        'Invalid page ID "{0}" provided. Page ID must be a positive integer.'.format(page_id)
    ))


def validate_page_title(page_title):
  """Validates the provided value is a valid page title.

  Args:
    page_title: The page title to validate.

  Returns:
    None

  Raises:
    ValueError: If the provided page title is invalid.
  """
  if not page_title or not is_str(page_title):
    raise ValueError((
        'Invalid page title "{0}" provided. Page title must be a non-empty string.'.format(
            page_title)
    ))


class InvalidRequest(Exception):
  """Wrapper class for building invalid request error responses."""
  status_code = 400

  def __init__(self, message, status_code=None, payload=None):
    Exception.__init__(self)
    self.message = message
    if status_code is not None:
      self.status_code = status_code
    self.payload = payload

  def to_dict(self):
    result = dict(self.payload or ())
    result['error'] = self.message
    return result
