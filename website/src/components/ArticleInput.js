import _ from 'lodash';
import axios from 'axios';
import React from 'react';
import Autosuggest from 'react-autosuggest';

import articleTitles from '../resources/articleTitles.json';

import {ArticleSuggestion, AutosuggestWrapper} from './ArticleInput.styles';

import {SDOW_API_URL} from '../resources/constants';

// When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.
const getSuggestionValue = (suggestion) => {
  return suggestion.name;
};

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
      placeholderText: articleTitles[Math.floor(Math.random() * articleTitles.length)],
    };

    this.debouncedLoadSuggestions = _.debounce(this.loadSuggestions, 500);

    setInterval(() => {
      this.setState({
        placeholderText: articleTitles[Math.floor(Math.random() * articleTitles.length)],
      });
    }, 3000);
  }

  loadSuggestions(value) {
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
    this.debouncedLoadSuggestions(value);
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  render() {
    const {suggestions, placeholderText} = this.state;
    const {toOrFrom, toArticleTitle, fromArticleTitle, onChange} = this.props;
    const value = toOrFrom === 'to' ? toArticleTitle : fromArticleTitle;

    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      placeholder: placeholderText,
      onChange: (event, {newValue}) => {
        onChange(toOrFrom, newValue);
      },
      value,
    };

    // Finally, render it!
    return (
      <AutosuggestWrapper>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
        />
      </AutosuggestWrapper>
    );
  }
}

export default ArticleInput;
