import axios from 'axios';
import React from 'react';

import {GoButton} from './SearchButton.styles';

// TODO: add stable production URL
// TODO: move into a shared file (maybe constants.js?)
const SDOW_API_URL = process.env.NODE_ENV === 'production' ? 'TODO' : 'http://127.0.0.1:5000';

class SearchButton extends React.Component {
  constructor() {
    super();

    this.state = {
      isFetching: false,
    };
  }

  fetchShortestPaths(fromArticleTitle, toArticleTitle, setError, setShortestPaths) {
    console.log(`fetchShortestPaths(${fromArticleTitle}, ${toArticleTitle}) called`);

    // Cancel the previous request
    this.setState({
      isFetching: true,
    });

    setError(null);
    setShortestPaths(null);

    axios({
      method: 'get',
      url: `${SDOW_API_URL}/paths/${fromArticleTitle}/${toArticleTitle}`,
    })
      .then((response) => {
        setShortestPaths(response.data.paths);

        this.setState({
          isFetching: false,
        });
      })
      .catch((error) => {
        setError(error.response.data.error);
      });
  }

  render() {
    const {toArticleTitle, fromArticleTitle, setError, setShortestPaths} = this.props;

    return (
      <GoButton
        onClick={this.fetchShortestPaths.bind(
          this,
          fromArticleTitle,
          toArticleTitle,
          setError,
          setShortestPaths
        )}
      >
        Go!
      </GoButton>
    );
  }
}

export default SearchButton;
