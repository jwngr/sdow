import * as d3 from 'd3';
import React from 'react';
import LazyLoad from 'react-lazyload';

import {
  ResultsListHeader,
  PageDescription,
  PageImage,
  PageTitle,
  PageWrapper,
  PageInnerWrapper,
  ResultsListItemWrapper,
  ResultsListWrapper,
  ResultsListOtherPathsText,
} from './ResultsList.styles';

import defaultPageThumbnail from '../images/defaultPageThumbnail.png';

const ResultListItem = ({pages}) => {
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const pagesContent = pages.map((page, i) => {
    let {description} = page;
    const {title, url, thumbnailUrl} = page;

    const descriptionContent = description ? (
      <PageDescription>{description}</PageDescription>
    ) : null;

    let backgroundColor = d3.rgb(color(i));
    backgroundColor.opacity = 0.9;

    return (
      <PageWrapper key={i} href={url} backgroundColor={backgroundColor} target="_blank">
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

export default ({paths}) => {
  const maxResultsToDisplay = 50;
  const numHiddenPaths = paths.length - maxResultsToDisplay;

  // Only display a limited number of results, lazily loading all of them.
  const resultsListItems = paths.slice(0, maxResultsToDisplay).map((path, i) => (
    <LazyLoad once={true} offset={200} key={i}>
      <ResultListItem pages={path} />
    </LazyLoad>
  ));

  return (
    <React.Fragment>
      <ResultsListHeader>Individual paths</ResultsListHeader>
      <ResultsListWrapper>{resultsListItems}</ResultsListWrapper>
      {numHiddenPaths > 0 && (
        <ResultsListOtherPathsText>
          Not showing {numHiddenPaths} more path{numHiddenPaths !== 1 && 's'}
        </ResultsListOtherPathsText>
      )}
    </React.Fragment>
  );
};
