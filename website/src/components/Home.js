import React from 'react';

import LoadingContainer from '../containers/LoadingContainer';
import PathResultsContainer from '../containers/PathResultsContainer';
import ErrorMessageContainer from '../containers/ErrorMessageContainer';
import SearchButtonContainer from '../containers/SearchButtonContainer';
import TargetPageInputContainer from '../containers/TargetPageInputContainer';
import SourcePageInputContainer from '../containers/SourcePageInputContainer';

import logo from '../images/logo.png';

import {P, Logo, InputFlexContainer} from './Home.styles';

export default () => (
  <div>
    <Logo src={logo} alt="Six Degrees of Wikipedia Logo" />

    <P>Find the shortest paths from</P>
    <InputFlexContainer>
      <SourcePageInputContainer />
      <P>to</P>
      <TargetPageInputContainer />
    </InputFlexContainer>

    <SearchButtonContainer />
    <LoadingContainer />
    <PathResultsContainer />
    <ErrorMessageContainer />
  </div>
);
