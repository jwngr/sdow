import React, {Component} from 'react';

import PathResultsContainer from '../containers/PathResultsContainer';
import SearchButtonContainer from '../containers/SearchButtonContainer';
import ToArticleInputContainer from '../containers/ToArticleInputContainer';
import FromArticleInputContainer from '../containers/FromArticleInputContainer';

import Loading from './Loading';
import logo from '../images/logo.png';

import {P, Logo, InputFlexContainer, MainContent, ErrorMessage} from './Home.styles';

class Home extends Component {
  render() {
    const {errorMessage, fromArticleTitle, toArticleTitle, isFetchingResults} = this.props;

    let resultContent;
    if (errorMessage !== null) {
      resultContent = <ErrorMessage>{errorMessage}</ErrorMessage>;
    } else if (isFetchingResults) {
      resultContent = <Loading />;
    } else {
      resultContent = <PathResultsContainer />;
    }

    let searchButtonContent;
    if (!isFetchingResults) {
      searchButtonContent = <SearchButtonContainer />;
    }

    return (
      <div>
        <Logo src={logo} alt="Six Degrees of Wikipedia Logo" />
        <MainContent>
          <P>Find the shortest paths from</P>
          <InputFlexContainer>
            <ToArticleInputContainer />
            <P style={{margin: '20px 24px'}}>to</P>
            <FromArticleInputContainer />
          </InputFlexContainer>

          {searchButtonContent}

          {resultContent}
        </MainContent>
      </div>
    );
  }
}

export default Home;
