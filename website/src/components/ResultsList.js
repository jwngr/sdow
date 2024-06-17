import * as d3 from 'd3';
import React from 'react';
import LazyLoad from 'react-lazyload';
import styled from 'styled-components';

import defaultPageThumbnail from '../images/defaultPageThumbnail.png';
import {WikipediaPage, WikipediaPageId} from '../types.ts';

const ResultsListWrapper = styled.div`
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: center;
`;

const ResultsListOtherPathsText = styled.p`
  margin: 16px auto 40px auto;
  text-align: center;
`;

const ResultsListHeader = styled.p`
  text-align: center;
  margin: 32px 0;
  font-size: 28px;
  font-weight: bold;
  color: ${({theme}) => theme.colors.darkGreen};
`;

const ResultsListItemWrapper = styled.div`
  margin: 8px;
  max-width: 340px;
  flex: 0 1 calc(33% - 16px);

  display: flex;
  flex-direction: column;

  border: solid 2px ${({theme}) => theme.colors.darkGreen};
  border-radius: 12px;

  @media (max-width: 1200px) {
    flex: 0 1 50%;
  }

  @media (max-width: 700px) {
    flex: 0 1 100%;
  }
`;

interface PageWrapperProps {
  readonly $highlightColor: string;
}

const PageWrapper = styled.a<PageWrapperProps>`
  display: block;
  overflow: hidden;
  text-decoration: none;
  display: flex;
  flex-direction: row;
  padding: 10px;
  align-items: center;
  height: 80px;
  cursor: pointer;
  color: ${({theme}) => theme.colors.darkGreen};
  border-bottom: solid 1px ${({theme}) => theme.colors.darkGreen};
  border-left: solid 12px ${({$highlightColor}) => $highlightColor};
  background-color: ${({theme}) => theme.colors.creme};

  &:first-of-type {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }

  &:last-of-type {
    border-bottom: none;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }

  &:hover {
    background: ${({theme}) => theme.colors.gray};
  }
`;

const PageInnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 68px;
  flex: 1;
`;

const PageImage = styled.img`
  width: 60px;
  height: 60px;
  margin-right: 12px;
  border-radius: 8px;
  border: solid 1px ${({theme}) => theme.colors.darkGreen};
  background-color: ${({theme}) => theme.colors.gray};
  object-fit: cover;
`;

const PageTitle = styled.p`
  font-size: 16px;
`;

const PageDescription = styled.p`
  font-size: 12px;
  max-height: 46px;
  overflow: hidden;
`;

const ResultListItem: React.FC<{
  readonly path: readonly WikipediaPageId[];
  readonly pagesById: Record<WikipediaPageId, WikipediaPage>;
}> = ({path, pagesById}) => {
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const pagesContent = path.map((pageId, i) => {
    const page = pagesById[pageId];
    if (!page) return null;
    const {description, title, url, thumbnailUrl} = page;

    const descriptionContent = description ? (
      <PageDescription>{description}</PageDescription>
    ) : null;

    const highlightColor = d3.rgb(color(i.toString()));
    highlightColor.opacity = 0.9;

    return (
      <PageWrapper key={i} href={url} $highlightColor={highlightColor.toString()} target="_blank">
        <PageImage src={thumbnailUrl || defaultPageThumbnail} />
        <PageInnerWrapper>
          <PageTitle>{title}</PageTitle>
          {descriptionContent}
        </PageInnerWrapper>
      </PageWrapper>
    );
  });

  return <ResultsListItemWrapper>{pagesContent}</ResultsListItemWrapper>;
};

export const ResultsList: React.FC<{
  readonly paths: readonly WikipediaPageId[][];
  readonly pagesById: Record<WikipediaPageId, WikipediaPage>;
}> = ({paths, pagesById}) => {
  const maxResultsToDisplay = 50;
  const numHiddenPaths = paths.length - maxResultsToDisplay;

  // Only display a limited number of results, lazily loading all of them.
  const resultsListItems = paths.slice(0, maxResultsToDisplay).map((path, i) => (
    <LazyLoad once={true} offset={200} key={i}>
      <ResultListItem path={path} pagesById={pagesById} />
    </LazyLoad>
  ));

  return (
    <>
      <ResultsListHeader>Individual paths</ResultsListHeader>
      <ResultsListWrapper>{resultsListItems}</ResultsListWrapper>
      {numHiddenPaths > 0 && (
        <ResultsListOtherPathsText>
          Not showing {numHiddenPaths} more path{numHiddenPaths !== 1 && 's'}
        </ResultsListOtherPathsText>
      )}
    </>
  );
};
