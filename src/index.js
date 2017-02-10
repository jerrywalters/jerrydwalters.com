import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { configureStore } from './store'
import { Router, Route, browserHistory, IndexRoute, IndexRedirect, location } from 'react-router';
import './index.css';
import { projects } from './projects'; 

// import { slideIn } from '../components/'

import App from './components/App';
// import Project from './components/Project/Project';
import ChatContainer from './components/ChatContainer';

const store = configureStore();
const mountApp = document.getElementById('root');

window.store = store;
window.browserHistory = browserHistory;
window.projects = projects;

render(
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path='/' component={App} />
      <Route path='project/:projectName' component={App} />
    </Router>
  </Provider>,
  mountApp
);

export default store;
