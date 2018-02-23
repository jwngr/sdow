import React from 'react';

import {Description, InnerWrapper, Image, Title, Wrapper} from './PageInputSuggestion.styles';

import defaultPageThumbnail from '../images/defaultPageThumbnail.png';

export default ({title, description, thumbnailUrl}) => {
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
