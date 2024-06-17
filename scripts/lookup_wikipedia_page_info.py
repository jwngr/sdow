#!/usr/local/bin/python
# coding: utf-8

"""
Looks up Wikipedia page information via the official Wikipedia API given a list of page IDs.
"""

import requests

WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php'


def query_wikipedia_api(identifier_type, page_ids_or_titles, resolve_redirects=False):
  if identifier_type not in ['pageids', 'titles']:
    print('[Error] Page identifier type must be "pageids" or "titles".')
  else:
    query_params = {
        'action': 'query',
        'format': 'json',
        'prop': 'info|redirects',
        'inprop': 'displaytitle',
    }

    if resolve_redirects:
      query_params['redirects'] = ''

    results = {}

    # IDs must be strings in order for the join below to work.
    page_ids_or_titles = [str(x) for x in page_ids_or_titles]

    start_query_index = 0
    while start_query_index < len(page_ids_or_titles):
      # Query at most 50 pages per request (given WikiMedia API limits).
      end_query_index = min(start_query_index + 50, len(page_ids_or_titles))

      query_params[identifier_type] = '|'.join(
          page_ids_or_titles[start_query_index:end_query_index])

      req = requests.get(WIKIPEDIA_API_URL, params=query_params)

      results.update(req.json().get('query', {}).get('pages', {}))

      start_query_index = end_query_index

    return results


ids_to_lookup = [
]

titles_to_lookup = [
]


ids_response_pages = {}
if len(ids_to_lookup) != 0:
  ids_response_pages = query_wikipedia_api('pageids', ids_to_lookup)

titles_response_pages = {}
if len(titles_to_lookup) != 0:
  titles_response_pages = query_wikipedia_api('titles', titles_to_lookup)

# Merge the response dicts.
response_pages = ids_response_pages.copy()
response_pages.update(titles_response_pages)

# Ensure all request pages were returned.
page_request_count = len(ids_to_lookup) + len(titles_to_lookup)
page_response_count = len(response_pages)

print('[INFO] {0} of {1} requested pages returned'.format(
    page_request_count, page_response_count))
if page_response_count < page_request_count:
  print('[ERROR] {0} requested pages were not returned'.format(
      page_request_count - page_response_count))
print()

# Print results.
errors = []
redirects = []
if len(response_pages) == 0:
  print('[ERROR] No pages found.')
else:
  for page_id, page in response_pages.iteritems():
    if page_id == '-1':
      errors.append('[ERROR] Page title "{0}" does not exist'.format(page['title']))
    elif 'missing' in page:
      errors.append('[ERROR] Page ID {0} does not exist'.format(page_id))
    elif 'redirect' in page:
      redirect_response = query_wikipedia_api('pageids', [page_id], True)
      (redirected_page_id, redirected_page) = redirect_response.items()[0]
      redirects.append((page['title'],
                        page_id,
                        redirected_page['title'],
                        redirected_page_id))
    else:
      print('"{0}" ({1})'.format(page['title'], page_id))

if len(redirects) != 0:
  print()

  for page_title, page_id, redirected_page_title, redirected_page_id in redirects:
    print('[WARNING] "{0}" ({1}) redirects to "{2}" ({3})'.format(
        page_title, page_id, redirected_page_title, redirected_page_id
    ))

if len(errors) != 0:
  print()

  for error in errors:
    print(error)
