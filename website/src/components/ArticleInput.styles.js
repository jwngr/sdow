import styled from 'styled-components';

const classNames = {
  input: 'react-autosuggest__input',
  container: 'react-autosuggest__container',
  suggestion: 'react-autosuggest__suggestion',
  suggestion_highlighted: 'react-autosuggest__suggestion--highlighted',
  suggestions_list: 'react-autosuggest__suggestions-list',
  suggestions_container: 'react-autosuggest__suggestions-container',
  suggestions_container_open: 'react-autosuggest__suggestions-container--open',
  input_open: 'react-autosuggest__input--open',
  input_focused: 'react-autosuggest__input--focused',
};

export const AutosuggestWrapper = styled.div.attrs(classNames)`
  .${classNames.container} {
    position: relative;
    display: inline;
  }

  .${classNames.suggestion} {
    cursor: pointer;
  }

  .${classNames.suggestion_highlighted} {
    background-color: #ddd;
  }

  .${classNames.suggestions_container} {
    display: none;
  }

  .${classNames.suggestions_container_open} {
    display: block;
    position: absolute;
    top: 41px;
    width: 500px;
    border: 1px solid #aaa;
    background-color: #fff;
    font-family: Helvetica, sans-serif;
    font-weight: 300;
    font-size: 16px;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    z-index: 2;
  }

  .${classNames.suggestions_list} {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }

  .${classNames.input} {
    width: 500px;
    height: 80px;
    border: solid 3px black;
    text-align: center;
    font-size: 40px;

    &::-webkit-input-placeholder {
      color: #000;
      opacity: 0.5;
      -webkit-transition: opacity 0.35s ease-in-out;
      transition: opacity 0.35s ease-in-out;
    }

    &:hover::-webkit-input-placeholder {
      opacity: 0.75;
    }

    &:focus::-webkit-input-placeholder {
      opacity: 0;
    }
  }

  &.${classNames.input_focused} {
    outline: none;
  }

  &.${classNames.input_open} {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}
`;

export const ArticleSuggestion = styled.div`
  padding: 10px;
  height: 40px;
  font-size: 32px;
`;
