import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import '../../styles/App.css';

import Header from '../Header/Header';
import ChatButton from '../Chat/ChatButtonContainer';
import ChatContainer from '../Chat/ChatContainer';
import Project from '../Project/ProjectContainer';
import Background from '../Background/Background';

function backHome() {
  if(location.pathname === '/project') {
    browserHistory.push('/')  
  }
}

class App extends Component {
  componentDidMount() {
    document.addEventListener("click", backHome);
    const background = document.getElementById('shapes-container');
    background.style.opacity = 0;
    window.requestAnimationFrame(function() {
      // Now set a transition on the opacity
      background.style.transition = "opacity 3s";
      // and set the opacity to 1
      background.style.opacity = 1;
    });
  }

  render(props) {
    console.log('location: ', this.props.location);
    return (
      <div className="app">
        <Header location={this.props.location} />
        <ChatContainer />
        <ChatButton />
        <Project location={this.props.location} />
        <Background />
      </div>
    );
  }
}

export default App;
