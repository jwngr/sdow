import React from 'react';

import LoadingContainer from '../containers/LoadingContainer';
import PathResultsContainer from '../containers/PathResultsContainer';
import ErrorMessageContainer from '../containers/ErrorMessageContainer';
import SearchButtonContainer from '../containers/SearchButtonContainer';
import ToArticleInputContainer from '../containers/ToArticleInputContainer';
import FromArticleInputContainer from '../containers/FromArticleInputContainer';

import logo from '../images/logo.png';

import {P, Logo, InputFlexContainer, MainContent} from './Home.styles';

export default () => (
  <div>
    <Logo src={logo} alt="Six Degrees of Wikipedia Logo" />
    <MainContent>
      <P>Find the shortest paths from</P>
      <InputFlexContainer>
        <FromArticleInputContainer />
        <P style={{margin: '20px 24px'}}>to</P>
        <ToArticleInputContainer />
      </InputFlexContainer>

      <SearchButtonContainer />
      <LoadingContainer />
      <PathResultsContainer />
      <ErrorMessageContainer />
    </MainContent>
  </div>
);
