import thunk from 'redux-thunk';
import {routerMiddleware} from 'connected-react-router';
import {createBrowserHistory} from 'history';
import {applyMiddleware, compose, createStore} from 'redux';

import createRootReducer from './reducers';

export const history = createBrowserHistory();

// Middleware.
const middleware = [thunk];
if (process.env.NODE_ENV !== 'production') {
  const {logger} = require('redux-logger');
  middleware.push(logger);
}

// Store.
export default function configureStore(preloadedState) {
  const store = createStore(
    createRootReducer(history),
    preloadedState,
    compose(applyMiddleware(routerMiddleware(history), ...middleware))
  );

  return store;
}
