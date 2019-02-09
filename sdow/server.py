"""
Server web framework.
"""

from __future__ import print_function

import os
import time
import logging
import google.cloud.logging

from sets import Set
from flask_cors import CORS
from database import Database
from flask_compress import Compress
from flask import Flask, request, jsonify
from helpers import InvalidRequest, fetch_wikipedia_pages_info


# Connect to the SDOW database.
database = Database(sdow_database='./sdow.sqlite', searches_database='./searches.sqlite')

# Initialize the Flask app.
app = Flask(__name__)

app.config['JSONIFY_PRETTYPRINT_REGULAR'] = False

# Add support for cross-origin requests.
CORS(app)

# Add gzip compression.
Compress(app)


# Gunicorn entry point.
def load_app(environment='dev'):
  # Initialize GCP logging (production only).
  if environment == 'prod':
    print('[INFO] Starting app in production mode with remote logging enabled...')
    logging_client = google.cloud.logging.Client()
    logging_client.setup_logging()

  return app


@app.errorhandler(500)
@app.errorhandler(Exception)
def unhandled_exception_handler(error):
  '''Unhandled exception handler.'''
  logging.exception('Internal server error: %s', {
      'error': error,
      'data': request.data
  })

  return jsonify({
      'error': 'An unexpected internal server error occurred. Please try again.'
  }), 500


@app.errorhandler(404)
@app.errorhandler(405)
def route_not_found_handler(error):
  '''Route not found handler.'''
  logging.warning('Route not found: {0} {1}'.format(request.method, request.path))
  return jsonify({
      'error': 'Route not found: {0} {1}'.format(request.method, request.path)
  }), 404


@app.errorhandler(InvalidRequest)
def invalid_request_handler(error):
  '''Invalid request handler.'''
  response = jsonify(error.to_dict())
  response.status_code = error.status_code
  return response


@app.route('/ok', methods=['GET'])
def ok_endpoint():
  '''Health check endpoint.'''
  return jsonify({
      'timestamp': int(round(time.time() * 1000))
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

  # Look up the IDs for each page
  try:
    (source_page_id, source_page_title,
     is_source_redirected) = database.fetch_page(request.json['source'])
  except ValueError:
    raise InvalidRequest(
        'Start page "{0}" does not exist. Please try another search.'.format(request.json['source'].encode('utf-8')))

  try:
    (target_page_id, target_page_title,
     is_target_redirected) = database.fetch_page(request.json['target'])
  except ValueError:
    raise InvalidRequest(
        'End page "{0}" does not exist. Please try another search.'.format(request.json['target'].encode('utf-8')))

  # Compute the shortest paths
  paths = database.compute_shortest_paths(source_page_id, target_page_id)

  response = {
      'sourcePageTitle': source_page_title,
      'targetPageTitle': target_page_title,
      'isSourceRedirected': is_source_redirected,
      'isTargetRedirected': is_target_redirected,
  }

  # No paths found
  if len(paths) == 0:
    logging.warn('No paths found from {0} to {1}'.format(source_page_id, target_page_id))
    response['paths'] = []
    response['pages'] = []
  # Paths found
  else:
    # Get a list of all IDs
    page_ids_set = Set()
    for path in paths:
      for page_id in path:
        page_ids_set.add(str(page_id))

    response['paths'] = paths
    response['pages'] = fetch_wikipedia_pages_info(list(page_ids_set), database)

  database.insert_result({
      'source_id': source_page_id,
      'target_id': target_page_id,
      'duration': time.time() - start_time,
      'paths': paths,
  })

  return jsonify(response)
