"""
Helper classes and methods.
"""

import requests


WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php'


def fetch_wikipedia_pages_info(page_ids, database):
  """Fetched page information such as title, URL, and image thumbnail URL for the provided page IDs.

  Args:
    page_title: The page title to validate.

  Returns:
    None

  Raises:
    ValueError: If the provided page title is invalid.
  """
  pages_info = {}

  current_page_ids_index = 0
  while current_page_ids_index < len(page_ids):
    # Query at most 50 pages per request (given WikiMedia API limits)
    end_page_ids_index = min(current_page_ids_index + 50, len(page_ids))

    query_params = {
        'action': 'query',
        'format': 'json',
        'pageids': '|'.join(page_ids[current_page_ids_index:end_page_ids_index]),
        'prop': 'info|pageimages|pageterms',
        'inprop': 'url|displaytitle',
        'piprop': 'thumbnail',
        'pithumbsize': 160,
        'pilimit': 50,
        'wbptterms': 'description',
    }

    current_page_ids_index = end_page_ids_index

    # Identify this client as per Wikipedia API guidelines.
    # https://www.mediawiki.org/wiki/API:Main_page#Identifying_your_client
    headers = {
        'User-Agent': 'Six Degrees of Wikipedia/1.0 (https://www.sixdegreesofwikipedia.com/; wenger.jacob@gmail.com)',
    }

    req = requests.get(WIKIPEDIA_API_URL, params=query_params, headers=headers)

    try:
      pages_result = req.json().get('query', {}).get('pages')
    except ValueError as error:
      # Wrap error message and re-raise exception.
      error_message = f"Failed to decode MediaWiki API response: {error}"
      raise ValueError(error_message) from error
    
    if (pages_result is None):
      raise ValueError('Empty MediaWiki API response')

    for page_id, page in pages_result.items():
      page_id = int(page_id)

      if 'missing' in page:
        # If the page has been deleted since the current Wikipedia database dump, fetch the page
        # title from the SDOW database and create the (albeit broken) URL.
        page_title = database.fetch_page_title(page_id)
        pages_info[page_id] = {
            'id': page_id,
            'title': page_title,
            'url': 'https://en.wikipedia.org/wiki/{0}'.format(page_title)
        }
      else:
        pages_info[page_id] = {
            'title': page['title'],
            'url': page['fullurl']
        }

        thumbnail_url = page.get('thumbnail', {}).get('source')
        if thumbnail_url:
          pages_info[page_id]['thumbnailUrl'] = thumbnail_url

        description = page.get('terms', {}).get('description', [])
        if description:
          pages_info[page_id]['description'] = description[0][0].upper() + description[0][1:]

  return pages_info


def get_sanitized_page_title(page_title):
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

  return page_title.strip().replace(' ', '_').replace("'", "\\'").replace('"', '\\"')


def get_readable_page_title(sanitized_page_title):
  """Returns the human-readable page title from the sanitized page title.

  Args:
    page_title: The santized page title to make human-readable.

  Returns:
    The human-readable page title.

  Examples:
    "Notre_Dame_Fighting_Irish"   => "Notre Dame Fighting Irish"
    "Farmers\'_market"            => "Farmers' market"
    "3.5\"_Floppy_disk"           => "3.5" Floppy disk"
    "Nip\\Tuck"                   => "Nip/Tuck"
  """
  return sanitized_page_title.strip().replace('_', ' ').replace("\\'", "'").replace('\\"', '"')


def is_str(val):
  """Returns whether or not the provided value is a string type.

  Args:
    val: The value to check.

  Returns:
    bool: Whether or not the provided value is a string type.
  """
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
