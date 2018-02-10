import React, {Component} from 'react';

import {Fact, Wrapper, LoadingIndicator} from './Loading.styles.js';

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
    return (
      <Wrapper>
        <LoadingIndicator>
          <div />
          <div />
          <div />
          <div />
        </LoadingIndicator>
        <Fact>{this.state.currentFact}</Fact>
      </Wrapper>
    );
  }
}

export default Loading;
