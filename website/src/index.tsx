import Particles from '@tsparticles/react';
import {createBrowserHistory} from 'history';
import React, {lazy, Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import {Route, Router, Switch} from 'react-router-dom';
import {ThemeProvider} from 'styled-components';

import {Home} from './components/Home.tsx';
import registerServiceWorker from './registerServiceWorker.js';
import particlesConfig from './resources/particles.config.json';
import theme from './resources/theme.json';

import './index.css';

const history = createBrowserHistory();

// Load fonts
require('typeface-quicksand');
require('typeface-crimson-text');

const AsyncBlog = lazy(() => import('./components/blog/Blog/index.js'));
const AsyncBlogPost = lazy(() => import('./components/blog/BlogPost/index.js'));

const root = createRoot(document.getElementById('root'));
root.render(
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

registerServiceWorker();
