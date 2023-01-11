import get from 'lodash/get';
import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import debounce from 'lodash/debounce';
import axios from 'axios';
import React, { useCallback, useState } from 'react';
import Autosuggest from 'react-autosuggest';

import {getRandomPageTitle} from '../utils';

import PageInputSuggestion from './PageInputSuggestion';

import {AutosuggestWrapper} from './PageInput.styles';

import {WIKIPEDIA_API_URL} from '../resources/constants';

// Autosuggest component helpers.
const getSuggestionValue = (suggestion) => suggestion.title;
const renderSuggestion = (suggestion) => <PageInputSuggestion {...suggestion} />;

const PageInput = props => {
  const [suggestions, setSuggestions] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [suggestions, setSuggestions] = useState();

  const {
    value,
    setPageTitle,
    placeholderText
  } = props;

  const componentWillReceivePropsHandler = useCallback(nextProps => {
    if (
      typeof placeholderTextIntervalHandler === 'undefined' ||
      props.value !== nextProps.value
    ) {
      clearInterval(placeholderTextIntervalHandler);

      if (nextProps.value === '') {
        placeholderTextIntervalHandler = setInterval(
          () => props.updateInputPlaceholderText(getRandomPageTitle()),
          5000
        );
      }
    }
  }, []);

  const loadSuggestionsHandler = useCallback(value => {
    setIsFetching(true);

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

      const pageResults = get(response, 'data.query.pages', {});
      forEach(pageResults, ({ns, index, title, terms, thumbnail}) => {
        // Due to https://phabricator.wikimedia.org/T189139, results will not always be limited
        // to the main namespace (0), so ignore all results which have a different namespace.
        if (ns === 0) {
          let description = get(terms, 'description.0');
          if (description) {
            description = description.charAt(0).toUpperCase() + description.slice(1);
          }

          suggestions[index - 1] = {
            title,
            description,
            thumbnailUrl: get(thumbnail, 'source'),
          };
        }
      });

      setIsFetching(false);
      setSuggestions(filter(suggestions));
    })
      .catch((error) => {
        // Report the error to Google Analytics, but don't report any user-facing error since the
        // input is still usable even without suggestions.
        const defaultErrorMessage = 'Request to fetch page suggestions from Wikipedia API failed.';
        window.ga('send', 'exception', {
          exDescription: get(error, 'response.data.error', defaultErrorMessage),
          exFatal: false,
        });
      });
  }, []);

  return (
    <AutosuggestWrapper>
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={({value}) => {
          debouncedLoadSuggestionsHandler(value);
        }}
        onSuggestionsClearRequested={() => {
          setSuggestions([]);
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
};

export default PageInput;
