import React from 'react';

import {
  ArticleDescription,
  ArticleImage,
  ArticleTitle,
  ArticleWrapper,
  ArticleInnerWrapper,
  Wrapper,
} from './PathResult.styles';

import defaultPageThumbnail from '../images/defaultPageThumbnail.png';

const PathResult = ({pages}) => {
  const pagesContent = pages.map((page, i) => {
    const {title, url, thumbnailUrl, description} = page;

    const descriptionContent = description ? (
      <ArticleDescription>{description}</ArticleDescription>
    ) : null;

    // let arrowContent;
    // if (!isEndArticle) {
    //   arrowContent = <span style={{margin: '20px'}}>==></span>;
    // }

    return (
      <ArticleWrapper key={i} href={url} target="_blank">
        <ArticleImage src={thumbnailUrl || defaultPageThumbnail} />
        <ArticleInnerWrapper>
          <ArticleTitle>{title}</ArticleTitle>
          {descriptionContent}
        </ArticleInnerWrapper>
      </ArticleWrapper>
    );
  });

  return <Wrapper>{pagesContent}</Wrapper>;
};

export default PathResult;
