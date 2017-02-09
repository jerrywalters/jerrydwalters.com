import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { configureStore } from './store'
import { Router, Route, browserHistory, IndexRoute, IndexRedirect } from 'react-router';
import './index.css';

import App from './components/App';
import SingleProject from './components/projects/SingleProject';
import ChatContainer from './components/ChatContainer';

const store = configureStore();
const mountApp = document.getElementById('root');

window.store = store;
window.browserHistory = browserHistory;

render(
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path='/' component={App}>
        <Route path='project' component={SingleProject} />
      </Route>
    </Router>
  </Provider>,
  mountApp
);

export default store;
