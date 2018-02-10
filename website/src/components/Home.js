import React, {Component} from 'react';

import PathResultsContainer from '../containers/PathResultsContainer';
import ArticleInputContainer from '../containers/ArticleInputContainer';
import SearchButtonContainer from '../containers/SearchButtonContainer';

import LoadingIndicator from './LoadingIndicator';

import {P, Header, InputFlexContainer, MainContent, ErrorMessage} from './Home.styles';

class Home extends Component {
  render() {
    const {error, isFetchingResults} = this.props;

    let resultContent;
    if (error !== null) {
      resultContent = <ErrorMessage>{error}</ErrorMessage>;
    } else if (isFetchingResults) {
      resultContent = <LoadingIndicator />;
    } else {
      resultContent = <PathResultsContainer />;
    }

    return (
      <div>
        <Header>
          {/*
            TODO: turn header logo into particle text
            See https://codepen.io/kelvinh111/pen/bNKQeY
            See https://codepen.io/Gthibaud/pen/pyeNKj
            See https://codepen.io/anon/pen/vpQeoy
            See https://codepen.io/tonx/pen/gbzJYO?q=particle+text&limit=all&type=type-pens
            Wikipedia fonts: Linux Libertine (current) and Hoefler Text (prior to 2010)
            See https://fonts.google.com/specimen/Crimson+Text?selection.family=Crimson+Text for a
            similar font
          */}
          <h1>Six Degrees Of Wikipedia</h1>
        </Header>
        <MainContent>
          <P>Find the shortest paths from</P>
          <InputFlexContainer>
            <ArticleInputContainer toOrFrom="from" placeholder="T. S. Eliot" />
            <P style={{margin: '20px 24px'}}>to</P>
            <ArticleInputContainer toOrFrom="to" placeholder="Fortune-telling" />
          </InputFlexContainer>

          <SearchButtonContainer />

          {resultContent}
        </MainContent>
      </div>
    );
  }
}

export default Home;
