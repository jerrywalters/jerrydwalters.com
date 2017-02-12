import React, { Component } from 'react';
import classNames from 'classnames';
import ChatMessages from './ChatMessages';


export default class Chat extends Component {
  constructor(props){
    super(props)
    this.sendMessage = this.props.sendMessage;
    this.updateIsTyping = this.props.updateIsTyping.bind(this);
  }

  componentDidUpdate() {
    const messageList = document.getElementsByClassName('client-messages');
    if(messageList) {
      messageList[0].scrollTop = messageList[0].scrollHeight; 
    }
  }

  formSubmit(inputText){
    let text = inputText.trim();
    if(!text || text === ' ') {
    } else {
      this.sendMessage(text);
    }
  }

  submitByIcon(e) {
    const input = document.getElementById('chat__input');
    this.formSubmit(input.innerText);
    input.innerHTML = '';
    e.preventDefault();
  }

  handleTyping(e) {
    const keyCode = e.keyCode;
    if (keyCode == 13 && e.shiftKey) {
    } else if (keyCode == 13) {
      const input = document.getElementById('chat__input');
      this.formSubmit(input.innerText);
      input.innerHTML = '';
       e.preventDefault();
    }
  }

  render() {
    const { sendMessage, location, isUncleOnline, uncleIsTyping, messages, isChatOpen, updateIsTyping } = this.props;
    let isTypingTimeout;

    function isClientTyping() {
      if (isTypingTimeout !== undefined) clearTimeout(isTypingTimeout);
      updateIsTyping(true);
      isTypingTimeout = setTimeout(function() {
        updateIsTyping(false);
      }, 2000);
    }

    const chatClasses = classNames({
      'chat-window': true,
      'hidden' : !isChatOpen
    });

    const statusClasses = classNames({
      'uncle-status' : true,
      'uncle-status--online' : isUncleOnline,
      'uncle-status--offline' : !isUncleOnline
    })
    
    return (
      <div className={chatClasses}>
        <header className="chat-header--client">
            <div className="uncle-icon"></div>
            <h3 className="uncle-name">Uncle Jerry</h3>
            <span className={statusClasses}></span>
        </header>   
        <ChatMessages messages={messages} uncleIsTyping={uncleIsTyping} />
        <form className="chat-form chat-form--client">
          <div contentEditable="true" 
              placeholder="message uncle" 
              className="chat-form__input" 
              id="chat__input" 
              onKeyDown={(e) => this.handleTyping(e)}
              onKeyPress={() => isClientTyping()}>
          </div>
          <input className="chat-form__submit" 
                 type="submit" 
                 onClick={ (e) => this.submitByIcon(e)}>
        </input>
        </form>
      </div>
    )
  }
}