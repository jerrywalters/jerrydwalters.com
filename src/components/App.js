import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import '../App.css';

class App extends Component {
  render(props) {
    console.log('location: ', this.props.location);
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

export default App;
