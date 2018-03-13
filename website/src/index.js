import React from 'react';
import thunk from 'redux-thunk';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import Loadable from 'react-loadable';
import Particles from 'react-particles-js';
import {ThemeProvider} from 'styled-components';
import {combineReducers, compose, createStore, applyMiddleware} from 'redux';
import {Fragment, routerForBrowser, initializeCurrentLocation} from 'redux-little-router';

import registerServiceWorker from './registerServiceWorker';

import Home from './components/Home';

import theme from './resources/theme.json';
import particlesConfig from './resources/particles.config.json';

import './index.css';

// Reducers
import rootReducers from './reducers/index.js';

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

// Router
const routes = {
  '/': {
    '/blog': {
      '/:postId': true,
    },
  },
};

const {reducer: routerReducer, middleware: routerMiddleware, enhancer} = routerForBrowser({
  routes,
});

// Middleware
const middleware = [thunk, routerMiddleware];
if (process.env.NODE_ENV !== 'production') {
  const {logger} = require('redux-logger');
  middleware.push(logger);
}

// Create the Redux store
const store = createStore(
  combineReducers({router: routerReducer, ...rootReducers}),
  compose(enhancer, applyMiddleware(...middleware))
);

// Initialize the current location of redux-little-router.
const initialLocation = store.getState().router;
if (initialLocation) {
  store.dispatch(initializeCurrentLocation(initialLocation));
}

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
        <Fragment forRoute="/">
          <div>
            <Fragment forRoute="/blog/:postId">
              <AsyncBlogPost />
            </Fragment>
            <Fragment forRoute="/blog">
              <AsyncBlog />
            </Fragment>
            <Fragment forRoute="/" forNoMatch>
              <Home />
            </Fragment>
          </div>
        </Fragment>
      </Provider>
    </React.Fragment>
  </ThemeProvider>,
  document.getElementById('root')
);

registerServiceWorker();
