import React, {Component} from 'react';

import {
  ArticleDescription,
  ArticleImage,
  ArticleTitle,
  ArticleWrapper,
  ArticleInnerWrapper,
  PathArticle,
  Wrapper,
} from './PathResult.styles';

import defaultPageThumbnail from '../images/defaultPageThumbnail.png';

const PathResult = ({pages}) => {
  console.log(pages);
  const pagesContent = pages.map((page) => {
    const {title, thumbnailUrl, description, isEndArticle} = page;

    const descriptionContent = description ? (
      <ArticleDescription>{description}</ArticleDescription>
    ) : null;

    // let arrowContent;
    // if (!isEndArticle) {
    //   arrowContent = <span style={{margin: '20px'}}>==></span>;
    // }

    return (
      <React.Fragment>
        <ArticleWrapper>
          <ArticleImage src={thumbnailUrl || defaultPageThumbnail} />
          <ArticleInnerWrapper>
            <ArticleTitle>{title}</ArticleTitle>
            {descriptionContent}
          </ArticleInnerWrapper>
        </ArticleWrapper>
        {/* {arrowContent} */}
      </React.Fragment>
    );
  });

  return <Wrapper>{pagesContent}</Wrapper>;
};

export default PathResult;
