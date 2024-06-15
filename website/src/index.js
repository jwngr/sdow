import Particles from '@tsparticles/react';
import {createBrowserHistory} from 'history';
// import {ConnectedRouter} from 'connected-react-router';
import React from 'react';
import {createRoot} from 'react-dom/client';
import Loadable from 'react-loadable';
import {Route, Router, Switch} from 'react-router-dom';
import {ThemeProvider} from 'styled-components';

import {Home} from './components/Home.tsx';
import registerServiceWorker from './registerServiceWorker';
import particlesConfig from './resources/particles.config.json';
import theme from './resources/theme.json';

import './index.css';

const history = createBrowserHistory();

// Load fonts
require('typeface-quicksand');
require('typeface-crimson-text');

// Async components
const AsyncBlog = Loadable({
  loader: () => import('./components/blog/Blog'),
  loading: () => null,
});

const AsyncBlogPost = Loadable({
  loader: () => import('./components/blog/BlogPost'),
  loading: () => null,
});

const root = createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={theme}>
    <React.Fragment>
      <Particles
        params={particlesConfig}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: -1,
        }}
      />
      <Router history={history}>
        <>
          <Switch>
            <Route path="/blog/:postId">
              <AsyncBlogPost />
            </Route>
            <Route path="/blog">
              <AsyncBlog />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </>
      </Router>
    </React.Fragment>
  </ThemeProvider>
);

registerServiceWorker();
