import {lazy, Suspense} from 'react';
import {Navigate, Params, useParams} from 'react-router-dom';

import {assertNever} from '../../utils';
import {Logo} from '../common/Logo';

const AsyncSearchResultsAnalysisPost = lazy(() =>
  import('./posts/searchResultsAnalysis/SearchResultsAnalysisPost').then((module) => ({
    default: module.SearchResultsAnalysisPost,
  }))
);

interface BlogPostRouteParams extends Params {
  readonly postId: string;
}

export const BlogPost: React.FC = () => {
  const params = useParams<BlogPostRouteParams>();
  const {postId} = params;

  if (!postId) {
    // This is technically already handled by the router, but needed to ensure type safety.
    return <Navigate to="/blog" replace />;
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
      // Since the post ID comes from an arbitrary URL, it may not match a valid blog post ID. If
      // this happens, redirect to the home page, replacing the current history stack.
      // TODO: Make `postId` an typesafe enum of all blog post IDs.
      return <Navigate to="/blog" replace />;
  }

  return (
    <>
      <Logo />
      {blogPostContent}
    </>
  );
};
