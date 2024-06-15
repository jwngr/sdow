import React from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import styled from 'styled-components';

import {Button} from './common/Button.tsx';

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

export const SearchButton: React.FC<{
  readonly isFetchingResults: boolean;
  readonly fetchShortestPaths: () => Promise<void>;
  readonly sourcePageTitle: string;
  readonly targetPageTitle: string;
}> = ({isFetchingResults, fetchShortestPaths, sourcePageTitle, targetPageTitle}) => {
  const history = useHistory();
  const location = useLocation();

  if (isFetchingResults) {
    return null;
  }

  const handleSearchClicked = async () => {
    if (sourcePageTitle.trim().length === 0 || targetPageTitle.trim().length === 0) {
      return;
    }

    await fetchShortestPaths();

    // Update the URL to reflect the new search.
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('source', sourcePageTitle);
    searchParams.set('target', targetPageTitle);
    history.push({search: searchParams.toString()});
  };

  return <SearchButtonWrapper onClick={handleSearchClicked}>Go!</SearchButtonWrapper>;
};
