import React from 'react';
import {useSelector} from 'react-redux';
import {useHistory, useLocation} from 'react-router-dom';
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
  const history = useHistory();
  const location = useLocation();
  const sourcePageTitleFromState = useSelector((state) => state.sourcePageTitle);
  const targetPageTitleFromState = useSelector((state) => state.targetPageTitle);

  if (isFetchingResults) {
    return null;
  }

  const handleSearchClicked = async () => {
    // Fetch the actual results.
    const {sourcePageTitle, targetPageTitle} = await fetchShortestPaths();

    // Update the URL to reflect the new search.
    const searchParams = new URLSearchParams(location.search);
    if (sourcePageTitleFromState) {
      searchParams.set('source', sourcePageTitleFromState);
    }
    if (targetPageTitleFromState) {
      searchParams.set('target', targetPageTitleFromState);
    }
    history.push({search: searchParams.toString()});
  };

  return <SearchButtonWrapper onClick={handleSearchClicked}>Go!</SearchButtonWrapper>;
};

export default SearchButton;
