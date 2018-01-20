import React, {Component} from 'react';

import {PathArticleWrapper} from './PathArticle.styles';

class PathArticle extends Component {
  render() {
    const {title, isEndArticle} = this.props;

    let arrowContent;
    if (!isEndArticle) {
      arrowContent = <span style={{margin: '20px'}}>==></span>;
    }

    return (
      <div style={{display: 'flex'}}>
        <PathArticleWrapper>{title}</PathArticleWrapper>
        {arrowContent}
      </div>
    );
  }
}

export default PathArticle;
