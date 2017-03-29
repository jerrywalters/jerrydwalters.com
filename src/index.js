import React from 'react';
import ReactDOM from 'react-dom';
// import './styles/App.css';
import { Provider } from 'react-redux';
import { configureStore } from './store'
import { Router, Route, browserHistory, IndexRoute, IndexRedirect, location } from 'react-router';
import { projects } from './projects'; 

import App from './components/App/App';
import Project from './components/Project/ProjectContainer'

const store = configureStore();
const mountApp = document.getElementById('root');

const MockIndex = () => {
  return <div></div>
}

window.store = store;
window.browserHistory = browserHistory;
window.projects = projects;

ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path='/' component={App}>
        <IndexRoute component={MockIndex}/>
        <Route path='project/:projectName' component={Project} />
      </Route>
      <Route path='*' component={App} />
    </Router>
  </Provider>,
  mountApp
);

export default store;
