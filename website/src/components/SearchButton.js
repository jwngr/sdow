import axios from 'axios';
import React from 'react';

import {GoButton} from './SearchButton.styles';

import {SDOW_API_URL} from '../resources/constants';

class SearchButton extends React.Component {
  constructor() {
    super();

    this.fetchShortestPaths = this.fetchShortestPaths.bind(this);
  }

  fetchShortestPaths() {
    const {
      toArticleTitle,
      fromArticleTitle,
      setError,
      setIsFetchingResults,
      setShortestPathResults,
    } = this.props;

    // TODO: handle cases where to or from page title is undefined

    // TODO: handle concurrent requests (e.g. cancel prior request)

    setIsFetchingResults(true);

    axios({
      url: `${SDOW_API_URL}/paths`,
      method: 'POST',
      data: {
        source: fromArticleTitle,
        target: toArticleTitle,
      },
    })
      .then((response) => {
        const {pages, paths} = response.data;

        const pathsDenormalized = paths.map((path) => {
          return path.map((pageId) => {
            return pages[pageId];
          });
        });

        setShortestPathResults({
          toArticleTitle,
          fromArticleTitle,
          paths: pathsDenormalized,
        });

        // TODO: measure the response time
        // See https://www.html5rocks.com/en/tutorials/webperformance/usertiming/
      })
      .catch((error) => {
        // TODO: test when the backend API URL is wrong or the Flask app is not running
        console.log(error);
        setError(error.response.data.error);
      });
  }

  render() {
    return <GoButton onClick={this.fetchShortestPaths}>Go!</GoButton>;
  }
}

export default SearchButton;
