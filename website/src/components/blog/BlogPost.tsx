import React, {lazy, Suspense} from 'react';
import {Redirect, useParams} from 'react-router-dom';

import {Logo} from '../common/Logo.tsx';

const AsyncSearchResultsAnalysisPost = lazy(() =>
  import('./posts/SearchResultsAnalysisPost/index.js').then((module) => ({
    default: module.SearchResultsAnalysisPost,
  }))
);

const getBlogPostContent = (postId) => {
  switch (postId) {
    case 'search-results-analysis':
      return (
        <Suspense fallback={null}>
          <AsyncSearchResultsAnalysisPost />
        </Suspense>
      );
    default:
      return <Redirect to="/blog" />;
  }
};

export const BlogPost = () => {
  const {postId} = useParams();

  return (
    <>
      <Logo />
      {getBlogPostContent(postId)}
    </>
  );
};
