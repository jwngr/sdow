import React, {Component} from 'react';

import {Description, InnerWrapper, Image, Title, Wrapper} from './PathArticle.styles';

import defaultPageThumbnail from '../images/defaultPageThumbnail.png';

class PathArticle extends Component {
  render() {
    const {title, thumbnailUrl, description, isEndArticle} = this.props;

    const descriptionContent = description ? <Description>{description}</Description> : null;

    let arrowContent;
    if (!isEndArticle) {
      arrowContent = <span style={{margin: '20px'}}>==></span>;
    }

    return (
      <React.Fragment>
        <Wrapper>
          <Image src={thumbnailUrl || defaultPageThumbnail} />
          <InnerWrapper>
            <Title>{title}</Title>
            {descriptionContent}
          </InnerWrapper>
        </Wrapper>
        {arrowContent}
      </React.Fragment>
    );
  }
}

export default PathArticle;
