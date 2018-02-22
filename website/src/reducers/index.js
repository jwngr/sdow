import * as actions from '../actions';

const rootReducers = {
  results: (state = null, action) => {
    switch (action.type) {
      case actions.SET_SHORTEST_PATH_RESULTS:
        return action.results;
      case actions.SET_ERROR_MESSAGE:
      case actions.FETCHING_RESULTS:
        return null;
      default:
        return state;
    }
  },

  isFetchingResults: (state = false, action) => {
    switch (action.type) {
      case actions.FETCHING_RESULTS:
        return true;
      case actions.SET_ERROR_MESSAGE:
      case actions.SET_SHORTEST_PATH_RESULTS:
        return false;
      default:
        return state;
    }
  },

  sourcePageTitle: (state = '15 (number)', action) => {
    switch (action.type) {
      case actions.SET_SOURCE_PAGE_TITLE:
        return action.sourcePageTitle;
      default:
        return state;
    }
  },

  targetPageTitle: (state = '20 (number)', action) => {
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
      case actions.FETCHING_RESULTS:
      case actions.SET_SHORTEST_PATH_RESULTS:
        return null;
      default:
        return state;
    }
  },
};

export default rootReducers;
