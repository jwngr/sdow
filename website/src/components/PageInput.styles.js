import styled from 'styled-components';

export const AutosuggestWrapper = styled.div`
  width: 500px;
  position: relative;

  .react-autosuggest__input {
    width: 100%;
    height: 72px;
    border: solid 3px ${(props) => props.theme.colors.darkGreen};
    text-align: center;
    font-size: 32px;
    background-color: ${(props) => props.theme.colors.creme};
    padding: 12px;
    text-overflow: ellipsis;

    &::-webkit-input-placeholder {
      color: ${(props) => props.theme.colors.darkGreen};
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

  .react-autosuggest__suggestion {
    cursor: pointer;
    border-bottom: solid 1px ${(props) => props.theme.colors.gray};

    &:last-of-type {
      border-bottom: none;

      &.react-autosuggest__suggestion--highlighted {
        border-bottom-left-radius: 12px;
        border-bottom-right-radius: 12px;
      }
    }
  }

  .react-autosuggest__suggestion--highlighted {
    background-color: ${(props) => props.theme.colors.gray};
  }

  .react-autosuggest__suggestions-container {
    display: none;
  }

  .react-autosuggest__suggestions-container--open {
    display: block;
    position: absolute;
    top: 69px;
    width: 100%;
    border: solid 3px ${(props) => props.theme.colors.darkGreen};
    background-color: ${(props) => props.theme.colors.creme};
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
