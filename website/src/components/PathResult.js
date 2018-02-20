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
    let {description} = page;
    const {title, url, thumbnailUrl} = page;

    let descriptionContent;
    if (typeof description !== 'undefined') {
      if (description.length > 103) {
        description = `${description.slice(0, 100)}...`;
      }
      descriptionContent = <ArticleDescription>{description}</ArticleDescription>;
    }

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
