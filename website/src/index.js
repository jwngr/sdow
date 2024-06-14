import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import Loadable from 'react-loadable';
import Particles from '@tsparticles/react';
import {ThemeProvider} from 'styled-components';
import {Route, Switch} from 'react-router-dom';
import {ConnectedRouter} from 'connected-react-router';
import configureStore, {history} from './configureStore.js';

import registerServiceWorker from './registerServiceWorker';

import Home from './components/Home';

import theme from './resources/theme.json';
import particlesConfig from './resources/particles.config.json';

import './index.css';

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

// Create the Redux store.
const store = configureStore();

ReactDOM.render(
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
      <Provider store={store}>
        <ConnectedRouter history={history}>
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
        </ConnectedRouter>
      </Provider>
    </React.Fragment>
  </ThemeProvider>,
  document.getElementById('root')
);

registerServiceWorker();
