import _ from 'lodash';
import axios from 'axios';
import React from 'react';
import Autosuggest from 'react-autosuggest';

import {getRandomArticleTitle, constructUrlWithQueryString} from '../utils';

import ArticleInputSuggestion from './ArticleInputSuggestion';

import {AutosuggestWrapper} from './ArticleInput.styles';

import {WIKIPEDIA_API_URL} from '../resources/constants';

// When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.
const getSuggestionValue = (suggestion) => {
  return suggestion.title;
};

// Use your imagination to render suggestions.
const renderSuggestion = ({title, description, thumbnailUrl}) => (
  <ArticleInputSuggestion title={title} description={description} thumbnailUrl={thumbnailUrl} />
);

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
      placeholderText: getRandomArticleTitle(),
    };

    this.debouncedLoadSuggestions = _.debounce(this.loadSuggestions, 250);

    setInterval(() => {
      this.setState((prevState) => {
        return {
          placeholderText: getRandomArticleTitle(prevState.placeholderText),
        };
      });
    }, 5000);
  }

  loadSuggestions(value) {
    // Cancel the previous request
    // TODO: do some work here to ensure a delayed prior request can't overwrite a later request
    this.setState({
      isFetching: true,
    });

    const queryParams = {
      action: 'query',
      format: 'json',
      gpssearch: value,
      generator: 'prefixsearch',
      prop: 'pageprops|pageimages|pageterms',
      redirects: '',
      ppprop: 'displaytitle',
      piprop: 'thumbnail',
      pithumbsize: '160',
      pilimit: '30',
      wbptterms: 'description',
      gpsnamespace: '0',
      gpslimit: 5,
      origin: '*',
    };

    axios({
      method: 'get',
      url: constructUrlWithQueryString(WIKIPEDIA_API_URL, queryParams),
    }).then((response) => {
      const suggestions = [];

      const pageResults = _.get(response, 'data.query.pages', {});
      _.forEach(pageResults, ({index, title, terms, thumbnail}) => {
        let description = _.get(terms, 'description.0');
        if (description) {
          description = description.charAt(0).toUpperCase() + description.slice(1);
        }
        suggestions[index - 1] = {
          title,
          description,
          thumbnailUrl: _.get(thumbnail, 'source'),
        };
      });

      this.setState({
        isFetching: false,
        suggestions: suggestions,
      });
    });
    // TODO: catch and handle errors.
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
