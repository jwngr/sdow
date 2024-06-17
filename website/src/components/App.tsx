import Particles from '@tsparticles/react';
import {createBrowserHistory} from 'history';
import React, {lazy, Suspense} from 'react';
import {Route, Router, Switch} from 'react-router-dom';
import {ThemeProvider} from 'styled-components';

import particlesConfig from '../resources/particles.config.json';
import theme from '../resources/theme.json';
import {Home} from './Home';

const history = createBrowserHistory();

const AsyncBlog = lazy(() => import('./blog/Blog').then((module) => ({default: module.Blog})));
const AsyncBlogPost = lazy(() =>
  import('./blog/BlogPost').then((module) => ({default: module.BlogPost}))
);

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <>
        <Particles
          options={particlesConfig}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: -1,
          }}
        />
        <Router history={history}>
          <Switch>
            <Route path="/blog/:postId">
              <Suspense fallback={null}>
                <AsyncBlogPost />
              </Suspense>
            </Route>
            <Route path="/blog">
              <Suspense fallback={null}>
                <AsyncBlog />
              </Suspense>
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </Router>
      </>
    </ThemeProvider>
  );
};
