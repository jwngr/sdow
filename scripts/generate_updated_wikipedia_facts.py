#!/usr/local/bin/python
# coding: utf-8

"""
Generates an updated Wikipedia facts JSON file.
"""

import os
import json
import sqlite3


def with_commas(val):
  """Formats the provided number with commas if it is has more than four digits."""
  return '{:,}'.format(int(val))


def get_percent_of_pages(val, decimal_places_count=2):
  """Returns the percentage of all pages the provided value represents."""
  return round(float(val) / float(query_results["non_redirect_pages_count"]) * 100, decimal_places_count)


sdow_database = './dump/sdow.sqlite'
if not os.path.isfile(sdow_database):
  raise IOError('Specified SQLite file "{0}" does not exist.'.format(sdow_database))

conn = sqlite3.connect(sdow_database)
cursor = conn.cursor()
cursor.arraysize = 1000

queries = {
    'non_redirect_pages_count': '''
    SELECT COUNT(*)
    FROM pages
    WHERE is_redirect = 0;
  ''',
    'links_count': '''
    SELECT SUM(outgoing_links_count)
    FROM links;
  ''',
    'redirects_count': '''
    SELECT COUNT(*)
    FROM redirects;
  ''',
    'pages_with_most_outgoing_links': '''
    SELECT title, outgoing_links_count
    FROM links
    INNER JOIN pages ON links.id = pages.id
    ORDER BY links.outgoing_links_count DESC
    LIMIT 5;
  ''',
    'pages_with_most_incoming_links': '''
    SELECT title, incoming_links_count
    FROM links
    INNER JOIN pages ON links.id = pages.id
    ORDER BY links.incoming_links_count DESC
    LIMIT 5;
  ''',
    'first_article_sorted_alphabetically': '''
    SELECT title
    FROM pages
    WHERE is_redirect = 0
    ORDER BY title ASC
    LIMIT 1;
  ''',
    'last_article_sorted_alphabetically': '''
    SELECT title
    FROM pages
    WHERE is_redirect = 0
    ORDER BY title DESC
    LIMIT 1;
  ''',
    'pages_with_no_incoming_or_outgoing_links_count': '''
    SELECT COUNT(*)
    FROM pages
    LEFT JOIN links ON pages.id = links.id
    WHERE is_redirect = 0
      AND links.id IS NULL;
  ''',
    'pages_with_no_outgoing_links_count': '''
    SELECT COUNT(*)
    FROM links
    WHERE outgoing_links_count = 0;
  ''',
    'pages_with_no_incoming_links_count': '''
    SELECT COUNT(*)
    FROM links
    WHERE incoming_links_count = 0;
  ''',
    'longest_page_title': '''
    SELECT title
    FROM pages
    WHERE is_redirect = 0
    ORDER BY LENGTH(title) DESC
    LIMIT 1;
  ''',
    'longest_page_titles_with_no_spaces': '''
    SELECT title
    FROM pages
    WHERE is_redirect = 0
      AND INSTR(title, '_') = 0
    ORDER BY LENGTH(title) DESC
    LIMIT 3;
  ''',
    'pages_with_single_character_title_count': '''
    SELECT COUNT(*)
    FROM pages
    WHERE is_redirect = 0
      AND LENGTH(title) = 1;
  ''',
    'page_titles_starting_with_exclamation_mark_count': '''
    SELECT COUNT(*)
    FROM pages
    WHERE is_redirect = 0
      AND title LIKE '!%';
  ''',
    'page_titles_containing_exclamation_mark_count': '''
    SELECT COUNT(*)
    FROM pages
    WHERE is_redirect = 0
      AND INSTR(title, '!') > 0;
  ''',
    'page_titles_starting_with_question_mark_count': '''
    SELECT COUNT(*)
    FROM pages
    WHERE is_redirect = 0
      AND title LIKE '?%';
  ''',
    'page_titles_containing_question_mark_count': '''
    SELECT COUNT(*)
    FROM pages
    WHERE is_redirect = 0
      AND INSTR(title, '?') > 0;
  ''',
    'page_titles_containing_spaces_count': '''
    SELECT COUNT(*)
    FROM pages
    WHERE is_redirect = 0
      AND INSTR(title, '_') > 0;
  ''',
    'page_titles_containing_no_spaces_count': '''
    SELECT COUNT(*)
    FROM pages
    WHERE is_redirect = 0
      AND INSTR(title, '_') = 0;
  ''',
    'page_titles_containing_quotation_mark_count': '''
    SELECT COUNT(*)
    FROM pages
    WHERE is_redirect = 0
      AND (INSTR(title, '"') > 0
           OR INSTR(title, "'") > 0);
  ''',
}

# Execute and store the result of each query.
query_results = {}
for key, query in queries.items():
  cursor.execute(query)

  current_query_results = []
  for i, result in enumerate(cursor.fetchall()):
    tokens = []
    for token in result:
      if not isinstance(token, (int, long)):
        token = token.encode('utf-8').replace('_', ' ')
      tokens.append(token)

    if (len(tokens) == 1):
      current_query_results.append(tokens[0])
    else:
      current_query_results.append(tokens)

  query_results[key] = current_query_results[0] if len(
      current_query_results) == 1 else current_query_results

facts = [
    "Wikipedia contains {0} pages.".format(with_commas(query_results["non_redirect_pages_count"])),
    "There are a total of {0} links between Wikipedia pages.".format(
        with_commas(query_results["links_count"])),
    "{0} Wikipedia pages are actually just redirects to other pages.".format(
        with_commas(query_results["redirects_count"])),

    "The first Wikipedia page title in alphabetical order is \"{0}\".".format(
        query_results["first_article_sorted_alphabetically"]),
    "The last Wikipedia page title in alphabetical order is \"{0}\".".format(
        query_results["last_article_sorted_alphabetically"]),

    "{0} Wikipedia pages ({1}% of all pages) have no incoming or outgoing links.".format(with_commas(
        query_results["pages_with_no_incoming_or_outgoing_links_count"]), get_percent_of_pages(query_results["pages_with_no_incoming_or_outgoing_links_count"], 3)),
    "There are only {0} Wikipedia pages ({1}% of all pages) which link to no other pages.".format(with_commas(
        query_results["pages_with_no_outgoing_links_count"] + query_results["pages_with_no_incoming_or_outgoing_links_count"]), get_percent_of_pages(query_results["pages_with_no_outgoing_links_count"] + query_results["pages_with_no_incoming_or_outgoing_links_count"])),
    "There are {0} Wikipedia pages ({1}% of all pages) which are not linked to from any other page.".format(with_commas(
        query_results["pages_with_no_incoming_links_count"] + query_results["pages_with_no_incoming_or_outgoing_links_count"]), get_percent_of_pages(query_results["pages_with_no_incoming_links_count"] + query_results["pages_with_no_incoming_or_outgoing_links_count"])),

    "At an impressive {0} characters, \"{1}\" is the longest Wikipedia page title.".format(len(query_results["longest_page_title"].decode('utf-8')),
                                                                                           query_results["longest_page_title"]),
    "There are {0} Wikipedia pages ({1}% of all pages) whose titles are just a single character, including \"Œ\", \"↓\", and \"膾\".".format(
        query_results["pages_with_single_character_title_count"], get_percent_of_pages(query_results["pages_with_single_character_title_count"], 3)),

    "Only {0} Wikipedia page titles begin with an exclamation mark, one of which is \"!O!ung_language\".".format(
        with_commas(query_results["page_titles_starting_with_exclamation_mark_count"])),
    "{0} Wikipedia pages ({1}%) have a title which contains an exclamation mark.".format(with_commas(
        query_results["page_titles_containing_exclamation_mark_count"]), get_percent_of_pages(query_results["page_titles_containing_exclamation_mark_count"])),

    "Only {0} Wikipedia page titles begin with a question mark, one of which is \"?:_A_Question_Mark\".".format(
        with_commas(query_results["page_titles_starting_with_question_mark_count"])),
    "{0} Wikipedia pages ({1}%) have a title which contains a question mark.".format(with_commas(
        query_results["page_titles_containing_question_mark_count"]), get_percent_of_pages(query_results["page_titles_containing_question_mark_count"])),

    "{0} Wikipedia pages ({1}%) have a title which contains a space.".format(with_commas(
        query_results["page_titles_containing_spaces_count"]), get_percent_of_pages(query_results["page_titles_containing_spaces_count"], 1)),
    "{0} Wikipedia pages ({1}%) have a title which does not contain a space.".format(with_commas(
        query_results["page_titles_containing_no_spaces_count"]), get_percent_of_pages(query_results["page_titles_containing_no_spaces_count"], 1)),

    "A single or double quotation mark can be found in {0} Wikipedia page titles ({1}% of all page titles), leading to countless parsing issues while creating this.".format(
        with_commas(query_results["page_titles_containing_quotation_mark_count"]), get_percent_of_pages(query_results["page_titles_containing_quotation_mark_count"])),

    "At a staggering {0} characters, \"{1}\" is the longest Wikipedia page title which contains no spaces.".format(
        len(query_results["longest_page_titles_with_no_spaces"][0].decode('utf-8')), query_results["longest_page_titles_with_no_spaces"][0]),
    "At a whopping {0} characters, \"{1}\" is the second longest Wikipedia page title which contains no spaces.".format(
        len(query_results["longest_page_titles_with_no_spaces"][1].decode('utf-8')), query_results["longest_page_titles_with_no_spaces"][1]),
    "Even at a beefy {0} characters, \"{1}\" is only the third longest Wikipedia page title which contains no spaces.".format(
        len(query_results["longest_page_titles_with_no_spaces"][2].decode('utf-8')), query_results["longest_page_titles_with_no_spaces"][2]),

    "The \"List of lists of lists\" page is a list of pages that are lists of list pages on the English Wikipedia.",
    "The \"Order of magnitude\" page lists \"yocto-\" (10^-24) and \"yotta-\" (10^24) as the smallest and largest magnitude prefixes.",
    "The \"Names of large numbers\" page contains words like \"googol\" (10^100) and \"millinillion\" (10^3003).",
    "An \"Illegal prime\" is a prime number that represents information whose possession or distribution is forbidden in some legal jurisdictions."
]

ordinals = ['', 'second ', 'third ', 'fourth ', 'fifth ']

for i, (title, outgoing_links_count) in enumerate(query_results["pages_with_most_outgoing_links"]):
  facts.append("\"{0}\" is the Wikipedia page with the {1}highest number of outgoing links ({2}).".format(
      title, ordinals[i], with_commas(outgoing_links_count)))

for i, (title, incoming_links_count) in enumerate(query_results["pages_with_most_incoming_links"]):
  facts.append("\"{0}\" is the {1}most linked to page on Wikipedia ({2} incoming links).".format(
      title, ordinals[i], with_commas(incoming_links_count)))

print(json.dumps(facts, indent=2, ensure_ascii=False))
