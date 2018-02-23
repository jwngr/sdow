import React from 'react';

import {
  PageDescription,
  PageImage,
  PageTitle,
  PageWrapper,
  PageInnerWrapper,
  Wrapper,
} from './PathResult.styles';

import defaultPageThumbnail from '../images/defaultPageThumbnail.png';

const PathResult = ({pages}) => {
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

  return <Wrapper>{pagesContent}</Wrapper>;
};

export default PathResult;
