import React from 'react';
import Loadable from 'react-loadable';
import {Redirect, useParams} from 'react-router-dom';

import Logo from '../../common/Logo';

const AsyncSearchResultsAnalysisPost = Loadable({
  loader: () => import('../posts/SearchResultsAnalysisPost'),
  loading: () => null,
});

const getBlogPostContent = (postId) => {
  switch (postId) {
    case 'search-results-analysis':
      return <AsyncSearchResultsAnalysisPost />;
    default:
      return <Redirect to="/blog" />;
  }
};

const BlogPost = () => {
  let {postId} = useParams();

  return (
    <React.Fragment>
      <Logo />
      {getBlogPostContent(postId)}
    </React.Fragment>
  );
};

export default BlogPost;
