import React from 'react';
import styled from 'styled-components';

import Button from './common/Button';

const SearchButtonWrapper = styled(Button)`
  width: 240px;
  height: 72px;
  margin: 0 auto 40px;
  font-size: 32px;
  border-radius: 8px;

  @media (max-width: 600px) {
    width: 200px;
    height: 60px;
    font-size: 28px;
  }
`;

const SearchButton = ({isFetchingResults, fetchShortestPaths}) => {
  if (isFetchingResults) {
    return null;
  }

  return <SearchButtonWrapper onClick={fetchShortestPaths}>Go!</SearchButtonWrapper>;
};

export default SearchButton;
