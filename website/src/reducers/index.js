import * as actions from '../actions';

const rootReducers = {
  results: (state = null, action) => {
    switch (action.type) {
      case actions.SET_SHORTEST_PATH_RESULTS:
        return action.results;
      case actions.SET_ERROR_MESSAGE:
      case actions.SET_IS_FETCHING_RESULTS:
        return null;
      default:
        return state;
    }
  },
  isFetchingResults: (state = false, action) => {
    switch (action.type) {
      case actions.SET_IS_FETCHING_RESULTS:
        return action.isFetchingResults;
      case actions.SET_ERROR_MESSAGE:
      case actions.SET_SHORTEST_PATH_RESULTS:
        return false;
      default:
        return state;
    }
  },
  toArticleTitle: (state = '', action) => {
    switch (action.type) {
      case actions.SET_TO_ARTICLE_TITLE:
        return action.toArticleTitle;
      default:
        return state;
    }
  },
  fromArticleTitle: (state = '', action) => {
    switch (action.type) {
      case actions.SET_FROM_ARTICLE_TITLE:
        return action.fromArticleTitle;
      default:
        return state;
    }
  },
  errorMessage: (state = null, action) => {
    switch (action.type) {
      case actions.SET_ERROR_MESSAGE:
        return action.errorMessage;
      case actions.SET_IS_FETCHING_RESULTS:
        return action.isFetchingResults ? null : state;
      case actions.SET_SHORTEST_PATH_RESULTS:
        return null;
      default:
        return state;
    }
  },
};

export default rootReducers;
