"""
Server web framework.
"""

import time
import requests
from sets import Set
from flask_cors import CORS
from sdow.database import Database
from flask_compress import Compress
from sdow.helpers import InvalidRequest
from flask import Flask, request, jsonify


SQLITE_FILENAME = '../sdow.sqlite'
WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php'


# TODO: figure out how to pass CLI arguments to Flask
# See http://flask.pocoo.org/snippets/133/
# if len(sys.argv) != 2:
#   print '[ERROR] Invalid program usage.'
#   print '[INFO] Usage: server.py <sqlite_file>'
#   sys.exit(1)

# sqlite_file = sys.argv[1]

database = Database(SQLITE_FILENAME)

app = Flask(__name__)

app.config['JSONIFY_PRETTYPRINT_REGULAR'] = False

# Add support for cross-origin requests.
CORS(app)

# Add gzip compression.
Compress(app)


@app.errorhandler(InvalidRequest)
def handle_invalid_usage(error):
  response = jsonify(error.to_dict())
  response.status_code = error.status_code
  return response


@app.route('/ok', methods=['GET'])
def health_check():
  """Health check endpoint."""
  return jsonify({
      'status': 'success',
      'timestamp': time.time()
  })


@app.route('/paths', methods=['POST'])
def shortest_paths_route():
  """Endpoint which returns a list of shortest paths between two Wikipedia pages.

    Args:
      source: The title of the page at which to start the search.
      target: The title of the page at which to end the search.

    Returns:
      dict: A JSON-ified dictionary containing the shortest paths (represented by a list of lists of
            page IDs) and the corresponding pages data (represented by a dictionary of page IDs).

    Raises:
      InvalidRequest: If either of the provided titles correspond to pages which do not exist.
  """
  start_time = time.time()

  source_page_title = request.json['source']
  target_page_title = request.json['target']

  # Look up the IDs for each page
  try:
    source_page_id = database.fetch_page_id(source_page_title)
  except ValueError:
    raise InvalidRequest(
        'Start page "{0}" does not exist. Please try another search.'.format(source_page_title.encode('utf-8')))

  try:
    target_page_id = database.fetch_page_id(target_page_title)
  except ValueError:
    raise InvalidRequest(
        'End page "{0}" does not exist. Please try another search.'.format(target_page_title.encode('utf-8')))

  # Compute the shortest paths
  paths = database.compute_shortest_paths(source_page_id, target_page_id)

  # No paths found
  if len(paths) == 0:
    response = {
        'paths': [],
        'pages': [],
    }
  # Paths found
  else:
    # Get a list of all IDs
    page_ids_set = Set()
    for path in paths:
      for page_id in path:
        page_ids_set.add(str(page_id))

    page_ids_list = list(page_ids_set)
    pages_info = {}

    current_page_ids_index = 0
    while current_page_ids_index < len(page_ids_list):
      # Query at most 50 pages per request (given WikiMedia API limits)
      end_page_ids_index = min(current_page_ids_index + 50, len(page_ids_list))

      query_params = {
          'action': 'query',
          'format': 'json',
          'pageids': '|'.join(page_ids_list[current_page_ids_index:end_page_ids_index]),
          'prop': 'info|pageimages|pageterms',
          'inprop': 'url|displaytitle',
          'piprop': 'thumbnail',
          'pithumbsize': 160,
          'pilimit': 50,
          'wbptterms': 'description',
      }

      current_page_ids_index = end_page_ids_index

      # TODO: make sure I identify client
      # 'Six Degrees of Wikipedia/1.0 (https://www.sixdegreesofwikipedia.com/; wenger.jacob@gmail.com)',
      # See https://www.mediawiki.org/wiki/API:Main_page#Identifying_your_client
      req = requests.get(WIKIPEDIA_API_URL, params=query_params)

      pages_result = req.json().get('query', {}).get('pages')

      for page_id, page in pages_result.iteritems():
        dev_page_id = int(page_id)

        pages_info[dev_page_id] = {
            'title': page['title'],
            'url': page['fullurl']
        }

        thumbnail_url = page.get('thumbnail', {}).get('source')
        if thumbnail_url:
          pages_info[dev_page_id]['thumbnailUrl'] = thumbnail_url

        description = page.get('terms', {}).get('description', [])
        if description:
          pages_info[dev_page_id]['description'] = description[0][0].upper() + description[0][1:]

    response = {
        'paths': paths,
        'pages': pages_info
    }

  database.insert_result({
      'source_id': source_page_id,
      'target_id': target_page_id,
      'duration': time.time() - start_time,
      'paths': paths,
  })

  return jsonify(response)


if __name__ == '__main__':
  app.run()
