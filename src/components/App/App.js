import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import '../../styles/App.css';

import Header from '../Header/Header';
import ChatButton from '../Chat/ChatButtonContainer';
import ChatContainer from '../Chat/ChatContainer';
import Project from '../Project/ProjectContainer';
import Background from '../Background/Background';
import Panel from '../Panel/Panel'

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
      <div className="app">
        <Header location={this.props.location} />
        <ChatContainer />
        <ChatButton />
        <Panel />
        <Project location={this.props.location} />
        <Background />
      </div>
    );
  }
}

export default App;
