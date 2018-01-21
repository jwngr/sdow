import React, {Component} from 'react';

import PathResultsContainer from '../containers/PathResultsContainer';
import ArticleInputContainer from '../containers/ArticleInputContainer';
import SearchButtonContainer from '../containers/SearchButtonContainer';

import {P, Header, InputFlexContainer, MainContent, ErrorMessage} from './Home.styles';

class Home extends Component {
  render() {
    const {error} = this.props;

    let errorContent;
    if (error !== null) {
      errorContent = <ErrorMessage>{error}</ErrorMessage>;
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

          <PathResultsContainer />

          {errorContent}
        </MainContent>
      </div>
    );
  }
}

export default Home;
