import _ from 'lodash';
import axios from 'axios';

import {SDOW_API_URL} from './resources/constants';

export const SET_ERROR_MESSAGE = 'SET_ERROR_MESSAGE';
export function setErrorMessage(errorMessage) {
  return {
    type: SET_ERROR_MESSAGE,
    errorMessage,
  };
}

export const FETCHING_RESULTS = 'FETCHING_RESULTS';
export function setFetchingResults(isFetchingResults) {
  return {
    type: FETCHING_RESULTS,
    isFetchingResults,
  };
}

export const SET_SHORTEST_PATH_RESULTS = 'SET_SHORTEST_PATH_RESULTS';
export function setShortestPathResults(results) {
  return {
    type: SET_SHORTEST_PATH_RESULTS,
    results,
  };
}

export const SET_SOURCE_PAGE_TITLE = 'SET_SOURCE_PAGE_TITLE';
export function setSourcePageTitle(sourcePageTitle) {
  return {
    type: SET_SOURCE_PAGE_TITLE,
    sourcePageTitle,
  };
}

export const SET_TARGET_PAGE_TITLE = 'SET_TARGET_PAGE_TITLE';
export function setTargetPageTitle(targetPageTitle) {
  return {
    type: SET_TARGET_PAGE_TITLE,
    targetPageTitle,
  };
}

export function fetchShortestPaths() {
  return (dispatch, getState) => {
    const {sourcePageTitle, targetPageTitle} = getState();

    let inputValidationErrorMessage;
    if (sourcePageTitle === '' && targetPageTitle === '') {
      inputValidationErrorMessage =
        "You'll probably want to choose the start and end pages before you hit that.";
    } else if (sourcePageTitle === '') {
      inputValidationErrorMessage =
        "You'll probably want to choose the start page before you hit that.";
    } else if (targetPageTitle === '') {
      inputValidationErrorMessage =
        "You'll probably want to choose the end page before you hit that.";
    }

    if (typeof inputValidationErrorMessage !== 'undefined') {
      dispatch(setErrorMessage(inputValidationErrorMessage));
    } else {
      dispatch(setFetchingResults());

      const startTimeInMilliseconds = Date.now();

      return axios({
        url: `${SDOW_API_URL}/paths`,
        method: 'POST',
        data: {
          source: sourcePageTitle,
          target: targetPageTitle,
        },
      }).then(
        (response) => {
          const {
            pages,
            paths,
            sourcePageTitle,
            targetPageTitle,
            isSourceRedirected,
            isTargetRedirected,
          } = response.data;

          const pathsDenormalized = paths.map((path) => {
            return path.map((pageId) => {
              return pages[pageId];
            });
          });

          dispatch(
            setShortestPathResults({
              sourcePageTitle,
              targetPageTitle,
              isSourceRedirected,
              isTargetRedirected,
              paths: pathsDenormalized,
              durationInSeconds: ((Date.now() - startTimeInMilliseconds) / 1000).toFixed(2),
            })
          );
        },
        // Don't use catch, because that will also catch any errors in the dispatch and resulting
        // render, causing a loop of 'Unexpected batch number' errors.
        (error) => {
          if (error.message === 'Network Error') {
            // This can happen when the server is down, the Flask app is not running, or when the
            // FLASK_DEBUG environment variable is set to 1 and there is a 5xx server error (see
            // https://github.com/corydolphin/flask-cors/issues/67 for details).
            dispatch(
              setErrorMessage(
                'Whoops... Six Degrees of Wikipedia is temporarily unavailable. Please try again in a few seconds.'
              )
            );
          } else {
            // This can happen when there is a 4xx or 5xx error (except for the case noted in the
            // comment above).
            const defaultErrorMessage =
              'Whoops... something is broken and has been reported. In the mean time, please try a different search.';
            dispatch(setErrorMessage(_.get(error, 'response.data.error', defaultErrorMessage)));
          }
        }
      );
    }
  };
}
