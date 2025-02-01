import React, {lazy, Suspense} from 'react';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import {ThemeProvider} from 'styled-components';

import theme from '../resources/theme.json';
import {Home} from './Home';

const AsyncBlog = lazy(() => import('./blog/Blog').then((module) => ({default: module.Blog})));
const AsyncBlogPost = lazy(() =>
  import('./blog/BlogPost').then((module) => ({default: module.BlogPost}))
);

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/blog"
            element={
              <Suspense fallback={null}>
                <AsyncBlog />
              </Suspense>
            }
          />
          <Route
            path="/blog/:postId"
            element={
              <Suspense fallback={null}>
                <AsyncBlogPost />
              </Suspense>
            }
          />
          {/* Redirect unmatched routes to home page, replacing history stack. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};
