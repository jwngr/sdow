import sys
import os.path
import sqlite3
from sdow import helpers
from sdow.breadth_first_search import breadth_first_search
from flask import Flask, jsonify, request

sqlite_file = '../sdow.sqlite'
# if len(sys.argv) != 2:
#   print '[ERROR] Invalid program usage.'
#   print '[INFO] Usage: server.py <sqlite_file>'
#   sys.exit(1)

# sqlite_file = sys.argv[1]

if not os.path.isfile(sqlite_file):
  print '[ERROR] Specified SQLite file "{0}" does not exist.'.format(sqlite_file)
  sys.exit(1)

app = Flask(__name__)

conn = sqlite3.connect(sqlite_file)
cursor = conn.cursor()


class InvalidRequest(Exception):
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

@app.errorhandler(InvalidRequest)
def handle_invalid_usage(error):
  response = jsonify(error.to_dict())
  response.status_code = error.status_code
  return response


@app.route('/pages/<page_name>')
def get_page_type(page_name):
  response = {}

  try:
    page_id = helpers.fetch_page_id(page_name, cursor)
  except ValueError as error:
    page_id = None
    response['type'] = 'not_found'

  if page_id:
    redirected_page_id = helpers.fetch_redirected_page_id(page_id, cursor)

    if redirected_page_id == None:
      response['type'] = 'page'
    else:
      response['type'] = 'redirect'
      response['redirected_page_id'] = redirected_page_id

  return jsonify(response)


@app.route('/paths/<from_page_name>/<to_page_name>')
def get_shortest_path_between_pages(from_page_name, to_page_name):
  try:
    from_page_id = helpers.fetch_page_id(from_page_name, cursor)
  except ValueError as error:
    raise InvalidRequest('From page name "{0}" does not exist.'.format(from_page_name))

  try:
    to_page_id = helpers.fetch_page_id(to_page_name, cursor)
  except ValueError as error:
    raise InvalidRequest('To page name "{0}" does not exist.'.format(to_page_name))

  paths = breadth_first_search(from_page_id, to_page_id, cursor)

  response = {
    'paths': paths,
    'count': len(paths)
  }

  if response['count'] != 0:
    response['length'] = len(paths[0])

  return jsonify(response)

if __name__ == "__main__":
  app.run()
