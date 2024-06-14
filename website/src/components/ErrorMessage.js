import React from 'react';

import styled from 'styled-components';

const P = styled.p`
  width: 700px;
  margin: 40px auto;
  font-size: 28px;
  text-align: center;
  line-height: 1.5;
  color: ${(props) => props.theme.colors.red};
  text-shadow: black 1px 1px;

  @media (max-width: 1200px) {
    width: 70%;
    font-size: 24px;
  }
`;

/**
 * Place bold tags around page titles in the provided error message.
 */
const boldPageTitles = (errorMessage) => {
  const errorMessageContent = [];
  const tokens = errorMessage.split('"');
  tokens.forEach((token, i) => {
    if (i % 2 === 0) {
      errorMessageContent.push(<span key={i}>{token}</span>);
    } else {
      errorMessageContent.push(<b key={i}>"{token}"</b>);
    }
  });

  return errorMessageContent;
};

const ErrorMessage = ({errorMessage}) =>
  errorMessage ? <P>{boldPageTitles(errorMessage)}</P> : null;

export default ErrorMessage;
