"""Runs a bi-directional breadth-first search between two Wikipedia articles and returns a list of the
shortest paths between them."""

import sqlite3
import helpers


def get_paths(page_ids, visited_dict):
  """Returns a list of paths which go from page_ids to either the start or end page."""

  # Hold the paths from the children of page_ids to either the start or end page
  paths = []

  for page_id in page_ids:
    if page_id == None:
      # If the current page ID is None, it is either the start or end page, so return an empty path
      return [[]]
    else:
      # Otherwise, recursively get the paths for the current page's children and append them to paths
      current_paths = get_paths(visited_dict[page_id], visited_dict)
      for current_path in current_paths:
        new_path = list(current_path)
        new_path.append(page_id)
        paths.append(new_path)

  return paths


def breadth_first_search(start, end, cursor, verbose=False):
  """Runs a bi-directional breadth-first search from start to end and returns a list of the shortest
  paths between them."""

  # TODO: Make sure command line args are ints

  # If start and end are identical, return the trivial path
  if start == end:
    return [[start]]

  # Create a list to hold every valid path from start to end
  paths = []

  # The unvisited dictionaries are a mapping from page ID to a list of that page's parents' IDs
  # (initialize them using None to signify that start and end have no parents)
  unvisited_forward = {start: [None]}
  unvisited_backward = {end: [None]}

  # The visited dictionaries are a mapping from page ID to a list of that page's parents' IDs
  # (initialize them as empty)
  visited_forward = {}
  visited_backward = {}

  # Set the initial forward and backward depths to 0
  forward_depth = 0
  backward_depth = 0

  # Continue the breadth first search until a path has been found or either of the unvisited lists
  # are empty
  while (len(paths) == 0) and ((len(unvisited_forward) != 0) and (len(unvisited_backward) != 0)):
    if verbose:
      print '\nLooping again...'
      print 'visited_forward: ' + str(visited_forward)
      print 'visited_backward: ' + str(visited_backward)
      print 'unvisited_forward: ' + str(unvisited_forward)
      print 'unvisited_backward: ' + str(unvisited_backward)

    #---  FORWARD BREADTH FIRST SEARCH  ---#
    # Run the next iteration of the breadth first search in the forward direction if unvisited
    # forward is smaller than unvisited backward
    if len(unvisited_forward) <= len(unvisited_backward):
      # Increment the forward depth
      forward_depth += 1

      # Print out the forward depth if the verbose flag is used
      if verbose:
        print 'Forward depth: ' + str(forward_depth)

      # Add each element from unvisited forward to visited forward
      for page_id in unvisited_forward:
        visited_forward[page_id] = unvisited_forward[page_id]

      # Run a query to obtain the ids of the pages which can be reached from the pages whose ids are
      # currently unvisited
      if len(unvisited_forward) == 1:
        unvisited_forward_keys_tuple = '({0})'.format(unvisited_forward.keys()[0])
      else:
        unvisited_forward_keys_tuple = str(tuple(unvisited_forward.keys()))

      forwards_results = helpers.run_forwards_links_query(unvisited_forward_keys_tuple, cursor)

      # Clear the unvisited forward dictionary
      unvisited_forward.clear()

      # Loop through each link retrieved by the query
      for from_id, to_id in forwards_results:
        # If the to id is in neither visited forward nor unvisited forward, add it to unvisited
        # forward
        if (to_id not in visited_forward) and (to_id not in unvisited_forward):
          unvisited_forward[to_id] = [from_id]

        # If the to id is in unvisited forward, append the from id as another one of its parents
        elif to_id in unvisited_forward:
          unvisited_forward[to_id].append(from_id)

    #---  BACKWARD BREADTH FIRST SEARCH  ---#
    # Run the next iteration of the breadth first search in the backward direction if unvisited
    # backward is smaller than unvisited forward
    else:
      # Increment the backward depth
      backward_depth += 1

      # Print out the backward depth if the verbose flag is used
      if verbose:
        print "Backward depth: " + str(backward_depth)

      # Add each element from unvisited backward to visited backward
      for page_id in unvisited_backward:
        visited_backward[page_id] = unvisited_backward[page_id]

      # Run a query to obtain the ids of the pages which link to the pages whose ids are currently
      # unvisited
      if len(unvisited_backward) == 1:
        unvisited_backward_keys_tuple = "(" + str(unvisited_backward.keys()[0]) + ")"
      else:
        unvisited_backward_keys_tuple = str(tuple(unvisited_backward.keys()))

      backwards_results = helpers.run_backwards_links_query(unvisited_backward_keys_tuple, cursor)

      # Clear the unvisited backward dictionary
      unvisited_backward.clear()

      # Loop through each link retrieved by the query
      for from_id, to_id in backwards_results:
        # If the from id is in neither visited backward nor unvisited backward, add it to unvisited
        # backward
        if (from_id not in visited_backward) and (from_id not in unvisited_backward):
          unvisited_backward[from_id] = [to_id]

        # If the from id is in unvisited backward, append the to id as another one of its parents
        elif from_id in unvisited_backward:
          unvisited_backward[from_id].append(to_id)

    #---  CHECK FOR PATH COMPLETION  ---#
    # If any of the ids in unvisited backward are also in unvisited forward, the breadth first
    # search is complete so find all the valid paths
    for page_id in unvisited_forward:
      if page_id in unvisited_backward:
        # Get the paths from start to page_id, inclusive
        start_paths = get_paths(unvisited_forward[page_id], visited_forward)

        # Get the paths from page_id to end
        end_paths = get_paths(unvisited_backward[page_id], visited_backward)

        if verbose:
          print 'start_paths: {0}'.format(start_paths)
          print 'end_paths: {0}'.format(end_paths)

        # Concatenate each start path with each end path and add them to the paths list
        for start_path in start_paths:
          for end_path in end_paths:
            current_path = list(start_path)
            current_path.append(page_id)
            current_end_path = list(end_path)
            current_end_path.reverse()
            current_path.extend(current_end_path)

            # TODO: why am I getting duplicates in the first place?
            if current_path not in paths:
              paths.append(current_path)

  # Return the list of shortest paths from start to end
  return paths
