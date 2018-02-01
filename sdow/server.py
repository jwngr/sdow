'''
Server web framework.
'''

# import sys
import requests
from sets import Set as set
from flask import Flask, jsonify
from sdow.database import Database
from sdow.helpers import InvalidRequest
from flask_cors import CORS, cross_origin

WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php'


sqlite_filename = '../sdow.sqlite'

# TODO: figure out how to pass CLI arguments to Flask
# See http://flask.pocoo.org/snippets/133/
# if len(sys.argv) != 2:
#   print '[ERROR] Invalid program usage.'
#   print '[INFO] Usage: server.py <sqlite_file>'
#   sys.exit(1)

# sqlite_file = sys.argv[1]

db = Database(sqlite_filename)

app = Flask(__name__)

# TODO: do I want this setup in production
CORS(app)


@app.errorhandler(InvalidRequest)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


@app.route('/paths/<from_page_name>/<to_page_name>')
def shortest_paths_route(from_page_name, to_page_name):
    # Look up the IDs for each page
    try:
        from_page_id = db.fetch_page_id(from_page_name)
    except ValueError as error:
        raise InvalidRequest(
            'From page name "{0}" does not exist.'.format(from_page_name))

    try:
        to_page_id = db.fetch_page_id(to_page_name)
    except ValueError as error:
        raise InvalidRequest(
            'To page name "{0}" does not exist.'.format(to_page_name))

    # Compute the shortest paths
    paths = db.compute_shortest_paths(from_page_id, to_page_id)

    if len(paths) == 0:
        # No paths found
        response = {
            'paths': [],
            'pages': [],
        }
    else:
        # Paths found

        # Get a list of all IDs
        page_ids = set()
        for path in paths:
            for page_id in path:
                page_ids.add(str(page_id))

        page_ids = list(page_ids)
        pages_info = {}

        current_page_ids_index = 0
        while current_page_ids_index < len(page_ids):
            # Query at most 50 pages per request (given WikiMedia API limits)
            end_page_ids_index = min(
                current_page_ids_index + 50, len(page_ids))

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
                    pages_info[dev_page_id]['description'] = description[0][0].upper(
                    ) + description[0][1:]

        response = {
            'paths': paths,
            'pages': pages_info
        }

    return jsonify(response)


if __name__ == "__main__":
    app.run()
