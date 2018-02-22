import React from 'react';
import thunk from 'redux-thunk';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import Particles from 'react-particles-js';
import {ThemeProvider} from 'styled-components';
import {routerForBrowser, Fragment} from 'redux-little-router';
import {combineReducers, compose, createStore, applyMiddleware} from 'redux';

import registerServiceWorker from './registerServiceWorker';

import About from './components/About';
import HomeContainer from './containers/HomeContainer';

import theme from './resources/theme.json';
import particlesConfig from './resources/particles.config.json';

import './index.css';

// Reducers
import rootReducers from './reducers/index.js';

// Load fonts
require('typeface-quicksand');
require('typeface-crimson-text');

// Router
const routes = {
  '/': {
    title: 'Home',
  },
  '/about': {
    title: 'About',
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
          <React.Fragment>
            <Fragment forRoute="/about">
              <About />
            </Fragment>
            <Fragment forNoMatch>
              <HomeContainer />
            </Fragment>
          </React.Fragment>
        </Fragment>
      </Provider>
    </React.Fragment>
  </ThemeProvider>,
  document.getElementById('root')
);

registerServiceWorker();
