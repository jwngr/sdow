import axios from 'axios';
import React from 'react';
import Autosuggest from 'react-autosuggest';

import {ArticleSuggestion} from './ArticleInput.styles';

// TODO: add stable production URL
const SDOW_API_URL = process.env.NODE_ENV === 'production' ? 'TODO' : 'http://127.0.0.1:5000';

// When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.
const getSuggestionValue = (suggestion) => suggestion.name;

// Use your imagination to render suggestions.
const renderSuggestion = (suggestion) => <ArticleSuggestion>{suggestion.name}</ArticleSuggestion>;

class ArticleInput extends React.Component {
  constructor() {
    super();

    // Autosuggest is a controlled component.
    // This means that you need to provide an input value
    // and an onChange handler that updates this value (see below).
    // Suggestions also need to be provided to the Autosuggest,
    // and they are initially empty because the Autosuggest is closed.
    this.state = {
      suggestions: [],
      isFetching: false,
    };
  }

  loadSuggestions(value) {
    // TODO: debounce this

    // Cancel the previous request
    this.setState({
      isFetching: true,
    });

    axios({
      method: 'get',
      url: `${SDOW_API_URL}/suggestions/${value}`,
    }).then((response) => {
      const suggestions = response.data.suggestions.map((suggestion) => {
        return {
          name: suggestion,
        };
      });

      this.setState({
        isFetching: false,
        suggestions: suggestions,
      });
    });
  }

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested = ({value}) => {
    this.loadSuggestions(value);
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  render() {
    const {suggestions} = this.state;
    const {toOrFrom, toArticleTitle, fromArticleTitle, onChange} = this.props;
    const value = toOrFrom === 'to' ? toArticleTitle : fromArticleTitle;
    const startOrEnd = toOrFrom === 'from' ? 'Start' : 'End';

    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      placeholder: `${startOrEnd} page title`,
      onChange: (event, {newValue}) => {
        onChange(toOrFrom, newValue);
      },
      value,
    };

    // Finally, render it!
    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
      />
    );
  }
}

export default ArticleInput;
