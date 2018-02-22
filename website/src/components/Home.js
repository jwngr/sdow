import React from 'react';

import LoadingContainer from '../containers/LoadingContainer';
import PathResultsContainer from '../containers/PathResultsContainer';
import ErrorMessageContainer from '../containers/ErrorMessageContainer';
import TargetPageInputContainer from '../containers/TargetPageInputContainer';
import SourcePageInputContainer from '../containers/SourcePageInputContainer';

import logo from '../images/logo.png';

import {P, Logo, InputFlexContainer, SearchButton} from './Home.styles';

export default ({fetchShortestPaths}) => (
  <div>
    <Logo src={logo} alt="Six Degrees of Wikipedia Logo" />

    <P>Find the shortest paths from</P>
    <InputFlexContainer>
      <SourcePageInputContainer />
      <P>to</P>
      <TargetPageInputContainer />
    </InputFlexContainer>

    <SearchButton onClick={fetchShortestPaths}>Go!</SearchButton>
    <LoadingContainer />
    <PathResultsContainer />
    <ErrorMessageContainer />
  </div>
);
