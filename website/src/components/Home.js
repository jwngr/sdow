import React, {Component} from 'react';

import PathResultsContainer from '../containers/PathResultsContainer';
import ArticleInputContainer from '../containers/ArticleInputContainer';
import SearchButtonContainer from '../containers/SearchButtonContainer';

import Loading from './Loading';
import logo from '../images/logo.png';

import {P, Logo, InputFlexContainer, MainContent, ErrorMessage} from './Home.styles';

class Home extends Component {
  render() {
    const {errorMessage, isFetchingResults} = this.props;

    let resultContent;
    if (errorMessage !== null) {
      resultContent = <ErrorMessage>{errorMessage}</ErrorMessage>;
    } else if (isFetchingResults) {
      resultContent = <Loading />;
    } else {
      resultContent = <PathResultsContainer />;
    }

    return (
      <div>
        <Logo src={logo} alt="Six Degrees of Wikipedia Logo" />
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
