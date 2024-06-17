import {lazy, Suspense} from 'react';
import {Redirect, useParams} from 'react-router-dom';

import {assertNever} from '../../utils';
import {Logo} from '../common/Logo';

const AsyncSearchResultsAnalysisPost = lazy(() =>
  import('./posts/searchResultsAnalysis/SearchResultsAnalysisPost').then((module) => ({
    default: module.SearchResultsAnalysisPost,
  }))
);

type BlogPostId = 'search-results-analysis';

interface Params {
  readonly postId: BlogPostId;
}

export const BlogPost: React.FC = () => {
  const {postId} = useParams<Params>();

  if (!postId) {
    return <Redirect to="/blog" />;
  }

  let blogPostContent: React.ReactNode;
  switch (postId) {
    case 'search-results-analysis':
      blogPostContent = (
        <Suspense fallback={null}>
          <AsyncSearchResultsAnalysisPost />
        </Suspense>
      );
      break;
    default:
      assertNever(postId);
  }

  return (
    <>
      <Logo />
      {blogPostContent}
    </>
  );
};
