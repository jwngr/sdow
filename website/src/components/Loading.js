import React, {Component} from 'react';

import {Fact, Wrapper, LoadingIndicator} from './Loading.styles.js';

import StyledLink from './common/StyledLink';

import {getWikipediaPageUrl, getRandomWikipediaFact} from '../utils';

class Loading extends Component {
  constructor() {
    super();

    this.state = {
      currentFact: getRandomWikipediaFact(),
    };

    setInterval(() => {
      this.setState({
        currentFact: getRandomWikipediaFact(),
      });
    }, 7000);
  }

  render() {
    let {currentFact} = this.state;
    const {isFetchingResults} = this.props;

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
          factContent.push(<span key={i}>{token}</span>);
        } else {
          if (token === 'Suzukake no Ki no Michi de ') {
            // Special-case stupid long page title which contains a double quotation mark.
            skipCount = 2;
            token = tokens[i] + '"' + tokens[i + 1] + '"' + tokens[i + 2];
          }
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
  }
}

export default Loading;
