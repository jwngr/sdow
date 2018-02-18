"""
Looks up Wikipedia page information via the official Wikipedia API given a list of page IDs.
"""

from __future__ import print_function

import requests

WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php'

# Add either ID(s) OR title(s) in their corresponding list.
ids_to_lookup = [
]

titles_to_lookup = [
]

# IDs must be strings in order for the join below to work.
ids_to_lookup = [str(id) for id in ids_to_lookup]

query_params = {
    'action': 'query',
    'format': 'json',
    # 'titles': '|'.join(titles_to_lookup),
    'pageids': '|'.join(ids_to_lookup),
    'prop': 'info',
    'inprop': 'displaytitle',
}

req = requests.get(WIKIPEDIA_API_URL, params=query_params)

response = req.json().get('query', {}).get('pages')

for page_id, page in response.iteritems():
  if page_id == '0':
    print('[ERROR] One or more pages does not exist.')
  else:
    print('{0} => {1}'.format(page_id, page['title'].encode('utf-8')))
