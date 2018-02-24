import React from 'react';
import LazyLoad from 'react-lazyload';

import {
  PageDescription,
  PageImage,
  PageTitle,
  PageWrapper,
  PageInnerWrapper,
  ResultsListItemWrapper,
  ResultsListWrapper,
} from './ResultsList.styles';

import defaultPageThumbnail from '../images/defaultPageThumbnail.png';

const ResultListItem = ({pages}) => {
  const pagesContent = pages.map((page, i) => {
    let {description} = page;
    const {title, url, thumbnailUrl} = page;

    const descriptionContent = description ? (
      <PageDescription>{description}</PageDescription>
    ) : null;

    return (
      <PageWrapper key={i} href={url} target="_blank">
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
  const resultsListItems = paths.map((path, i) => {
    // Lazy load results beyond the first twelve.
    if (i > 11) {
      return (
        <LazyLoad once={true} offset={400} key={i}>
          <ResultListItem pages={path} />
        </LazyLoad>
      );
    } else {
      return <ResultListItem key={i} pages={path} />;
    }
  });

  return <ResultsListWrapper>{resultsListItems}</ResultsListWrapper>;
};
