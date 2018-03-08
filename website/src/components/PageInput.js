import _ from 'lodash';
import axios from 'axios';
import React from 'react';
import Autosuggest from 'react-autosuggest';

import {getRandomPageTitle} from '../utils';

import PageInputSuggestion from './PageInputSuggestion';

import {AutosuggestWrapper} from './PageInput.styles';

import {WIKIPEDIA_API_URL} from '../resources/constants';

// Autosuggest component helpers.
const getSuggestionValue = (suggestion) => suggestion.title;
const renderSuggestion = (suggestion) => <PageInputSuggestion {...suggestion} />;

class PageInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      suggestions: [],
      isFetching: false,
    };

    props.updateInputPlaceholderText(getRandomPageTitle());

    this.debouncedLoadSuggestions = _.debounce(this.loadSuggestions, 250);
  }

  componentWillReceiveProps(nextProps) {
    if (
      typeof this.placeholderTextInterval === 'undefined' ||
      this.props.value !== nextProps.value
    ) {
      clearInterval(this.placeholderTextInterval);

      if (nextProps.value === '') {
        this.placeholderTextInterval = setInterval(
          () => this.props.updateInputPlaceholderText(getRandomPageTitle()),
          5000
        );
      }
    }
  }

  loadSuggestions(value) {
    this.setState({
      isFetching: true,
    });

    const queryParams = {
      action: 'query',
      format: 'json',
      gpssearch: value,
      generator: 'prefixsearch',
      prop: 'pageprops|pageimages|pageterms',
      redirects: '', // Automatically resolve redirects
      ppprop: 'displaytitle',
      piprop: 'thumbnail',
      pithumbsize: '160',
      pilimit: '30',
      wbptterms: 'description',
      gpsnamespace: 0, // Only return results in Wikipedia's main namespace
      gpslimit: 5, // Return at most five results
      origin: '*',
    };

    // TODO: add helper for making API requests to WikiMedia API
    axios({
      method: 'get',
      url: WIKIPEDIA_API_URL,
      params: queryParams,
      headers: {
        'Api-User-Agent':
          'Six Degrees of Wikipedia/1.0 (https://www.sixdegreesofwikipedia.com/; wenger.jacob@gmail.com)',
      },
    })
      .then((response) => {
        const suggestions = [];

        const pageResults = _.get(response, 'data.query.pages', {});
        _.forEach(pageResults, ({ns, index, title, terms, thumbnail}) => {
          // Due to https://phabricator.wikimedia.org/T189139, results will not always be limited
          // to the main namespace (0), so ignore all results which have a different namespace.
          if (ns === 0) {
            let description = _.get(terms, 'description.0');
            if (description) {
              description = description.charAt(0).toUpperCase() + description.slice(1);
            }

            suggestions[index - 1] = {
              title,
              description,
              thumbnailUrl: _.get(thumbnail, 'source'),
            };
          }
        });

        // Due to ignoring non-main namespaces above, the suggestions array may have some missing
        // items, so remove them via _.filter().
        this.setState({
          isFetching: false,
          suggestions: _.filter(suggestions),
        });
      })
      .catch((error) => {
        // Report the error to Google Analytics, but don't report any user-facing error since the
        // input is still usable even without suggestions.
        const defaultErrorMessage = 'Request to fetch page suggestions from Wikipedia API failed.';
        window.ga('send', 'exception', {
          exDescription: _.get(error, 'response.data.error', defaultErrorMessage),
          exFatal: false,
        });
      });
  }

  render() {
    const {value, setPageTitle, placeholderText} = this.props;
    const {suggestions} = this.state;

    return (
      <AutosuggestWrapper>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={({value}) => {
            this.debouncedLoadSuggestions(value);
          }}
          onSuggestionsClearRequested={() => {
            this.setState({
              suggestions: [],
            });
          }}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={{
            placeholder: placeholderText,
            onChange: (event, {newValue}) => {
              setPageTitle(newValue);
            },
            value,
          }}
        />
      </AutosuggestWrapper>
    );
  }
}

export default PageInput;
