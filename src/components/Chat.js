import React, { Component } from 'react';
import classNames from 'classnames';
import ChatMessages from './ChatMessages';

export default class Chat extends Component {
  constructor(props){
    super(props)
  }

  componentDidUpdate() {
    const messageList = document.getElementsByClassName('client-messages');
    if(messageList) {
      messageList[0].scrollTop = messageList[0].scrollHeight; 
    }
  }

  render() {
    const { sendMessage, location, isUncleOnline, messages, isChatOpen } = this.props;

    const chatClasses = classNames({
      'chat-window': true,
      'hidden' : !isChatOpen
    });

    function formSubmit(e){
      e.preventDefault();
      const input = document.getElementById('chat__input').value;
      sendMessage(input);
      document.getElementById('chat__input').value = '';
    }
    
    return (
      <div className={chatClasses}>
        <header className="chat-header--client">
            <div className="uncle-icon"></div>
            <h3 className="uncle-name">Uncle Jerry</h3>
            <span className="uncle-status">{(isUncleOnline === true) ? 'online' : 'offline'}</span>
        </header>   
        <ChatMessages messages={messages}/>
        <form className="chat-form chat-form--client" onSubmit={(e) => formSubmit(e)}>
          <input className="chat-form__input"id="chat__input" type="text"></input>
          <input className="chat-form__submit" type="submit" ></input>
        </form>
      </div>
    )
  }
}
