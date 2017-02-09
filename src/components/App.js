import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import '../App.css';

import ChatButton from './ChatButtonContainer';
import ChatContainer from './ChatContainer';

class App extends Component {
  render(props) {
    console.log('location: ', this.props.location);
    return (
      <div>
        {this.props.children}
        <ChatContainer />
        <ChatButton />
      </div>
    );
  }
}

export default App;
