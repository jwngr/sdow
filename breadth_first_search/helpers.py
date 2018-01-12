def fetch_page_id_from_page_name(page_name, cursor):
  '''
  Returns the page ID corresponding to the provided page name.
  '''
  escaped_page_name = page_nameify(page_name)

  # TODO: do I need encode('utf-8') here?
  query = 'SELECT id FROM pages WHERE name="{0}"'.format(escaped_page_name)
  cursor.execute(query)

  page_id = cursor.fetchone()

  if page_id == None:
    raise Exception('[ERROR] Invalid page name provided: {0}'.format(page_name))

  # TODO: handle redirects

  page_id = page_id[0]

  query = 'SELECT to_id FROM redirects WHERE from_id="{0}"'.format(page_id)
  cursor.execute(query)

  redirected_page_id = cursor.fetchone()

  if redirected_page_id == None:
    return page_id
  else:
    redirected_page_id = redirected_page_id[0]

    query = 'SELECT name FROM pages WHERE id="{0}"'.format(redirected_page_id)
    cursor.execute(query)

    redirected_page_name = cursor.fetchone()[0]

    print '[INFO] "{0}" redirects to "{1}"'.format(page_name, redirected_page_name)

    return redirected_page_id

def page_nameify(original):
  '''
  Converts the provided string into an actual Wikipedia page name, replacing spaces with underscores.
  '''

  # TODO: validate page_name is a string

  # Replace spaces with underscores
  return original.replace(' ', '_')

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
