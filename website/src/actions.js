// Action types
export const SET_ERROR_MESSAGE = 'SET_ERROR_MESSAGE';
export const SET_SOURCE_PAGE_TITLE = 'SET_SOURCE_PAGE_TITLE';
export const SET_TARGET_PAGE_TITLE = 'SET_TARGET_PAGE_TITLE';
export const SET_IS_FETCHING_RESULTS = 'SET_IS_FETCHING_RESULTS';
export const SET_SHORTEST_PATH_RESULTS = 'SET_SHORTEST_PATH_RESULTS';

// Action creators
export function setErrorMessage(errorMessage) {
  return {
    type: SET_ERROR_MESSAGE,
    errorMessage,
  };
}

export function setIsFetchingResults(isFetchingResults) {
  return {
    type: SET_IS_FETCHING_RESULTS,
    isFetchingResults,
  };
}

export function setShortestPathResults(results) {
  return {
    type: SET_SHORTEST_PATH_RESULTS,
    results,
  };
}

export function setSourcePageTitle(sourcePageTitle) {
  return {
    type: SET_SOURCE_PAGE_TITLE,
    sourcePageTitle,
  };
}

export function setTargetPageTitle(targetPageTitle) {
  return {
    type: SET_TARGET_PAGE_TITLE,
    targetPageTitle,
  };
}
