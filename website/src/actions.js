// Action types
export const SET_ERROR_MESSAGE = 'SET_ERROR_MESSAGE';
export const SET_TO_ARTICLE_TITLE = 'SET_TO_ARTICLE_TITLE';
export const SET_FROM_ARTICLE_TITLE = 'SET_FROM_ARTICLE_TITLE';
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
    isFetchingResults: isFetchingResults,
  };
}

export function setShortestPathResults(results) {
  return {
    type: SET_SHORTEST_PATH_RESULTS,
    results,
  };
}

export function setToArticleTitle(toArticleTitle) {
  return {
    type: SET_TO_ARTICLE_TITLE,
    toArticleTitle,
  };
}

export function setFromArticleTitle(fromArticleTitle) {
  return {
    type: SET_FROM_ARTICLE_TITLE,
    fromArticleTitle,
  };
}
