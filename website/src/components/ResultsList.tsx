import * as d3 from 'd3';
import React, {useMemo, useState} from 'react';
import styled from 'styled-components';

import defaultPageThumbnail from '../images/defaultPageThumbnail.png';
import {WikipediaPage, WikipediaPageId} from '../types';
import {LazyLoadWrapper} from './common/LazyLoadWrapper';

/** Number of results to load at a time. */
const RESULT_BATCH_LOAD_SIZE = 50;

const ResultsListWrapper = styled.div`
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: center;
`;

const LoadMoreButton = styled.button`
  margin: 16px auto 40px auto;
  display: block;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  color: ${({theme}) => theme.colors.creme};
  background-color: ${({theme}) => theme.colors.darkGreen};
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: translateY(1px);
  }
`;

const ResultsListHeader = styled.p`
  text-align: center;
  margin: 32px 0 8px 0;
  font-size: 28px;
  font-weight: bold;
  color: ${({theme}) => theme.colors.darkGreen};
`;

const ResultsListSubHeader = styled.p`
  text-align: center;
  margin: 8px 0 32px 0;
  font-size: 16px;
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
  max-height: 60px;
  margin-right: 12px;
  object-fit: contain;
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
  const [maxResultsToDisplay, setMaxResultsToDisplay] = useState(RESULT_BATCH_LOAD_SIZE);
  const numHiddenPaths = paths.length - maxResultsToDisplay;
  const hasMorePaths = numHiddenPaths > 0;

  const handleLoadMore = () => {
    setMaxResultsToDisplay((prev) => prev + RESULT_BATCH_LOAD_SIZE);
  };

  const resultsListItems = useMemo(
    () => paths.slice(0, maxResultsToDisplay),
    [paths, maxResultsToDisplay]
  );

  return (
    <>
      <ResultsListHeader>Individual paths</ResultsListHeader>
      <ResultsListSubHeader>
        Showing {Math.min(paths.length, maxResultsToDisplay)} of {paths.length} result
        {paths.length !== 1 ? 's' : ''}
      </ResultsListSubHeader>
      <LazyLoadWrapper fallback={null}>
        <ResultsListWrapper>
          {resultsListItems.map((path, i) => (
            <ResultListItem key={i} path={path} pagesById={pagesById} />
          ))}
        </ResultsListWrapper>
      </LazyLoadWrapper>
      {hasMorePaths && (
        <LoadMoreButton onClick={handleLoadMore}>
          Load {Math.min(numHiddenPaths, RESULT_BATCH_LOAD_SIZE)} more results
        </LoadMoreButton>
      )}
    </>
  );
};
