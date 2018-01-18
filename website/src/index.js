import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';

import registerServiceWorker from './registerServiceWorker';

import HomeContainer from './containers/HomeContainer';

import './index.css';

// Reducers
import rootReducer from './reducers/index.js';

// Load fonts
require('typeface-quicksand');

// Middleware
const middleware = [];
if (process.env.NODE_ENV !== 'production') {
  const {logger} = require('redux-logger');
  middleware.push(logger);
}

// Create the Redux store
const store = createStore(rootReducer, applyMiddleware(...middleware));

ReactDOM.render(
  <Provider store={store}>
    <HomeContainer />
  </Provider>,
  document.getElementById('root')
);

registerServiceWorker();
