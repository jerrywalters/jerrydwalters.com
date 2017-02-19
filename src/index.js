import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { configureStore } from './store'
import { Router, Route, browserHistory, IndexRoute, IndexRedirect, location } from 'react-router';
import './styles/index.css';
import { projects } from './projects'; 

import App from './components/App/App';
import Project from './components/Project/ProjectContainer'

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
