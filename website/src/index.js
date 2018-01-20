import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import Particles from 'react-particles-js';
import {createStore, applyMiddleware} from 'redux';

import registerServiceWorker from './registerServiceWorker';

import HomeContainer from './containers/HomeContainer';

import particlesConfig from './resources/particles.config.json';

import './index.css';

// Reducers
import rootReducer from './reducers/index.js';

// Load fonts
require('typeface-quicksand');
require('typeface-crimson-text');

// Middleware
const middleware = [];
if (process.env.NODE_ENV !== 'production') {
  const {logger} = require('redux-logger');
  middleware.push(logger);
}

// Create the Redux store
const store = createStore(rootReducer, applyMiddleware(...middleware));

ReactDOM.render(
  <div>
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
      <HomeContainer />
    </Provider>
  </div>,
  document.getElementById('root')
);

registerServiceWorker();
