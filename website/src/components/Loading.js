import React, {Component} from 'react';

import {Fact, Wrapper, LoadingIndicator} from './Loading.styles.js';

import ArticleLink from './ArticleLink';

import {getRandomWikipediaFact} from '../utils';

class Loading extends Component {
  constructor() {
    super();

    let currentFact = getRandomWikipediaFact([]);

    this.state = {
      currentFact,
      previousFacts: [],
    };

    setInterval(() => {
      this.setState((prevState) => {
        currentFact = getRandomWikipediaFact(prevState.previousFacts);
        return {
          currentFact,
          previousFacts: [...prevState.previousFacts, currentFact],
        };
      });
    }, 7000);
  }

  render() {
    let {currentFact} = this.state;

    // Replace page titles in the current fact with a link to the corresponding Wikipedia article.
    let skipCount = 0;
    const factContent = [];
    const tokens = currentFact.split('"');
    tokens.forEach((token, i) => {
      if (skipCount === 0) {
        if (i % 2 === 0) {
          factContent.push(<span>{token}</span>);
        } else {
          if (token === 'Suzukake no Ki no Michi de ') {
            // Special-case stupid long page title which contains a double quotation mark.
            factContent.push(
              <ArticleLink title={tokens[i] + '"' + tokens[i + 1] + '"' + tokens[i + 2]} />
            );
            skipCount = 2;
          } else {
            factContent.push(<ArticleLink title={token} />);
          }
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
