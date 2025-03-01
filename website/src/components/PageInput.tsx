import debounce from 'lodash/debounce';
import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import Autosuggest from 'react-autosuggest';
import styled from 'styled-components';

import {SDOW_USER_AGENT, WIKIPEDIA_API_URL} from '../resources/constants';
import {WikipediaPage} from '../types';
import {getRandomPageTitle} from '../utils';
import {PageInputSuggestion} from './PageInputSuggestion';

type PageSuggestion = Required<Omit<WikipediaPage, 'url'>>;

const AutosuggestWrapper = styled.div`
  width: 500px;
  position: relative;

  .react-autosuggest__input {
    width: 100%;
    height: 72px;
    border: solid 3px ${({theme}) => theme.colors.darkGreen};
    text-align: center;
    font-size: 32px;
    background-color: ${({theme}) => theme.colors.creme};
    padding: 12px;
    text-overflow: ellipsis;

    &::placeholder {
      color: ${({theme}) => theme.colors.darkGreen};
      opacity: 0.5;
      transition: opacity 0.35s ease-in-out;
    }

    &:hover::placeholder {
      opacity: 0.75;
    }

    &:focus::placeholder {
      opacity: 0;
    }
  }

  .react-autosuggest__suggestion {
    padding: 10px;
    cursor: pointer;
    overflow: hidden;
    border-bottom: solid 1px ${({theme}) => theme.colors.gray};

    &:last-of-type {
      border-bottom: none;

      &.react-autosuggest__suggestion--highlighted {
        border-bottom-left-radius: 12px;
        border-bottom-right-radius: 12px;
      }
    }
  }

  .react-autosuggest__suggestion--highlighted {
    background-color: ${({theme}) => theme.colors.gray};
  }

  .react-autosuggest__suggestions-container {
    display: none;
  }

  .react-autosuggest__suggestions-container--open {
    display: block;
    position: absolute;
    top: 69px;
    width: 100%;
    border: solid 3px ${({theme}) => theme.colors.darkGreen};
    background-color: ${({theme}) => theme.colors.creme};
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    z-index: 2;
  }

  .react-autosuggest__suggestions-list {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }

  @media (max-width: 600px) {
    width: 80%;

    .react-autosuggest__input {
      font-size: 24px;
      height: 60px;
    }

    .react-autosuggest__suggestions-container--open {
      top: 57px;
    }
  }
`;

export const PageInput: React.FC<{
  readonly title: string;
  readonly setTitle: (title: string) => void;
  readonly placeholderText: string;
  readonly setPlaceholderText: (placeholderText: string) => void;
}> = ({title, setTitle, placeholderText, setPlaceholderText}) => {
  const [suggestions, setSuggestions] = useState<readonly PageSuggestion[]>([]);

  // Update placeholder text every 5 seconds when the title is empty.
  useEffect(() => {
    if (title !== '') return;

    const intervalId = setInterval(() => {
      setPlaceholderText(getRandomPageTitle());
    }, 5_000);

    return () => clearInterval(intervalId);
  }, [setPlaceholderText, title]);

  const loadSuggestions = useCallback(async (query: string) => {
    const url = new URL(WIKIPEDIA_API_URL);
    url.search = new URLSearchParams({
      action: 'query',
      format: 'json',
      gpssearch: query,
      generator: 'prefixsearch',
      prop: 'pageprops|pageimages|pageterms',
      redirects: '',
      ppprop: 'displaytitle',
      piprop: 'thumbnail',
      pithumbsize: '160',
      pilimit: '30',
      wbptterms: 'description',
      gpsnamespace: '0',
      gpslimit: '5',
      origin: '*',
    }).toString();

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {'Api-User-Agent': SDOW_USER_AGENT},
      });

      const data = await response.json();

      const pageResults = get(data, 'query.pages', {});
      const newSuggestions: PageSuggestion[] = [];
      forEach(pageResults, (all) => {
        const {ns, id, title, terms, thumbnail} = all;
        if (ns === 0) {
          let description = get(terms, 'description.0', '');
          description = description.charAt(0).toUpperCase() + description.slice(1);
          newSuggestions.push({id, title, description, thumbnailUrl: get(thumbnail, 'source')});
        }
      });
      setSuggestions(filter(newSuggestions));
    } catch (error) {
      const defaultErrorMessage = 'Failed to fetch page suggestions from Wikipedia API.';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).ga('send', 'exception', {
        exDescription: get(error, 'response.data.error', defaultErrorMessage),
        exFatal: false,
      });
    }
  }, []);

  const debouncedLoadSuggestions = useMemo(() => debounce(loadSuggestions, 300), [loadSuggestions]);

  return (
    <AutosuggestWrapper>
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={({value}) => debouncedLoadSuggestions(value)}
        onSuggestionsClearRequested={() => setSuggestions([])}
        getSuggestionValue={(suggestion) => suggestion.title}
        renderSuggestion={(suggestion) => (
          <PageInputSuggestion
            title={suggestion.title}
            description={suggestion.description}
            thumbnailUrl={suggestion.thumbnailUrl}
          />
        )}
        inputProps={{
          placeholder: placeholderText,
          onChange: (_, {newValue}) => setTitle(newValue),
          value: title,
        }}
      />
    </AutosuggestWrapper>
  );
};
