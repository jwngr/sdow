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

  sourcePageTitle: (state = '', action) => {
    switch (action.type) {
      case actions.SET_SOURCE_PAGE_TITLE:
        return action.sourcePageTitle;
      default:
        return state;
    }
  },

  targetPageTitle: (state = '', action) => {
    switch (action.type) {
      case actions.SET_TARGET_PAGE_TITLE:
        return action.targetPageTitle;
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
