import React from 'react';
import {connect} from 'react-redux';
import Loadable from 'react-loadable';
import {push} from 'redux-little-router';

import Logo from '../../common/Logo';

const AsyncSearchResultsAnalysisPost = Loadable({
  loader: () => import('../posts/SearchResultsAnalysisPost'),
  loading: () => null,
});

const AsyncBuildingSdowPost = Loadable({
  loader: () => import('../posts/BuildingSdow'),
  loading: () => null,
});

const getBlogPostContent = (postId, redirectToBlog) => {
  switch (postId) {
    case 'search-results-analysis':
      return <AsyncSearchResultsAnalysisPost />;
    case 'building-six-degrees-of-wikipedia':
      return <AsyncBuildingSdowPost />;
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
