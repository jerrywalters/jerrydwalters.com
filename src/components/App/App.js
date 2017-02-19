import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import '../../styles/App.css';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import Header from '../Header/Header';
import ChatButton from '../Chat/ChatButtonContainer';
import ChatContainer from '../Chat/ChatContainer';

import Background from '../Background/BackgroundContainer';

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
    const children = this.props.children;
    let path = this.props.location.pathname;
    let segment = path.split('/')[2] || 'root';
    return (
      <div className="app">
        <Header location={this.props.location} />
        <ChatContainer />
        <ChatButton />
        <ReactCSSTransitionGroup
          transitionName="pageSlider"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}
        >
          { React.cloneElement(children, {
            key: segment
          }) }
        </ReactCSSTransitionGroup>    
        <Background />
      </div>
    );
  }
}

export default App;
