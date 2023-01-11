import React, { Component, useState } from 'react';

import {Fact, Wrapper, LoadingIndicator} from './Loading.styles.js';

import StyledLink from './common/StyledLink';

import {getWikipediaPageUrl, getRandomWikipediaFact} from '../utils';

const Loading = props => {
  const [currentFact, setCurrentFact] = useState(getRandomWikipediaFact());

  const {
    isFetchingResults
  } = props;

  let {currentFact} = stateHandler;

  if (!isFetchingResults) {
    return null;
  }

  // Replace page titles in the current fact with a link to the corresponding Wikipedia page.
  let skipCount = 0;
  const factContent = [];
  const tokens = currentFact.split('"');

  tokens.forEach((token, i) => {
    if (skipCount === 0) {
      if (i % 2 === 0) {
        // Regular text
        factContent.push(<span key={i}>{token}</span>);
      } else {
        // Wikipedia link
        // Single apostrophe is used for Wikipedia links which themselves have a double apostrophe
        // in them.
        token = token.replace(/'/g, `"`);
        factContent.push(
          <StyledLink href={getWikipediaPageUrl(token)} target="_blank" key={i}>
            {token}
          </StyledLink>
        );
      }
    } else {
      skipCount--;
    }
  });

  return (
    <Wrapper>
      <LoadingIndicator>
        <div />
        <div />
        <div />
        <div />
      </LoadingIndicator>
      <Fact>{factContent}</Fact>
    </Wrapper>
  );
};

export default Loading;
