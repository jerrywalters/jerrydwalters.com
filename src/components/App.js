import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import '../App.css';

import ChatButton from './ChatButtonContainer';
import ChatContainer from './ChatContainer';
import Project from './Project/SingleProject'

function backHome() {
  if(location.pathname === '/project') {
    browserHistory.push('/')  
  }
}

class App extends Component {
  componentDidMount() {
    document.addEventListener("click", backHome);
  }

  render(props) {
    console.log('location: ', this.props.location);
    return (
      <div>
        <ChatContainer />
        <ChatButton />
        <Project location={this.props.location} />
      </div>
    );
  }
}

export default App;
