import React from 'react';

import defaultPageThumbnail from '../images/defaultPageThumbnail.png';
import {Description, Image, InnerWrapper, Title, Wrapper} from './PageInputSuggestion.styles';

const PageInputSuggestion = ({title, description, thumbnailUrl}) => {
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

export default PageInputSuggestion;
