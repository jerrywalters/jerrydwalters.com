import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import reducer from './reducers/reducers';
import initialState from './initialState';

export function configureStore() {

  const logger = createLogger();
  let middleware = [thunk, logger];

  let store = {};
  // Load Chrome Dev Tools Extension if DEV mode
  if (process.env.NODE_ENV !== 'production') {
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    store = createStore(reducer, initialState, composeEnhancers(
      applyMiddleware(...middleware)
    ));
  } else {
    store = createStore(reducer, initialState, applyMiddleware(...middleware));
  }

  return store;
}
