import React from 'react';
import {connect} from 'react-redux';
import {push} from 'redux-little-router';

import Logo from '../../common/Logo';
import SearchResultsAnalysisPost from '../posts/SearchResultsAnalysisPost';

const getBlogPostContent = (postId, redirectToBlog) => {
  switch (postId) {
    case 'search-results-analysis':
      return <SearchResultsAnalysisPost />;
    default:
      redirectToBlog();
      return;
  }
};

const BlogPost = ({postId, redirectToBlog}) => (
  <React.Fragment>
    <Logo />
    {getBlogPostContent(postId, redirectToBlog)}
  </React.Fragment>
);

const mapStateToProps = ({router}) => ({postId: router.params.postId});
const mapDispatchToProps = (dispatch) => ({
  redirectToBlog: () => dispatch(push('/blog')),
});

export default connect(mapStateToProps, mapDispatchToProps)(BlogPost);
