import React from 'react';

import {Description, InnerWrapper, Image, Title, Wrapper} from './ArticleInputSuggestion.styles';

import defaultPageThumbnail from '../images/defaultPageThumbnail.png';

const ArticleInputSuggestion = ({title, description, thumbnailUrl}) => {
  if (typeof description === 'string' && description.length > 153) {
    description = `${description.slice(0, 150)}...`;
  }

  const descriptionContent = description ? <Description>{description}</Description> : null;

  return (
    <Wrapper>
      <Image src={thumbnailUrl || defaultPageThumbnail} />
      <InnerWrapper>
        <Title>{title}</Title>
        {descriptionContent}
      </InnerWrapper>
    </Wrapper>
  );
};

export default ArticleInputSuggestion;
