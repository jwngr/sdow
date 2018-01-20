// Action types
export const SET_ERROR = 'SET_ERROR';
export const SET_SHORTEST_PATHS = 'SET_SHORTEST_PATHS';
export const SET_TO_ARTICLE_TITLE = 'SET_TO_ARTICLE_TITLE';
export const SET_FROM_ARTICLE_TITLE = 'SET_FROM_ARTICLE_TITLE';

// Action creators
export function setError(errorMessage) {
  return {
    type: SET_ERROR,
    errorMessage,
  };
}

export function setShortestPaths(paths, pages) {
  return {
    type: SET_SHORTEST_PATHS,
    paths,
    pages,
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


