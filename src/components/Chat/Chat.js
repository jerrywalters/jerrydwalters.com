import React, { Component } from 'react';
import classNames from 'classnames';
import ChatMessages from './ChatMessages';
import Panel from '../Panel/PanelContainer';
import ChatForm from './ChatForm'

import jerryIcon from '../../images/jerry-icon2.png'

export default class Chat extends Component {

  componentDidUpdate() {
    const messageList = document.getElementsByClassName('client-messages');
    if(messageList) {
      // very slight delay here so scrollheight is set properly for images and isTyping
      setTimeout(() => messageList[0].scrollTop = messageList[0].scrollHeight, 10)
    }
  }

  render() {
    const { 
      sendMessage, 
      isUncleOnline, 
      uncleIsTyping, 
      messages, 
      isChatOpen, 
      updateIsTyping, 
      togglePainting, 
      isPainting 
    } = this.props;

    // don't allow click through to projects
    function stopClickThrough(e){
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
    }

    const chatClasses = classNames({
      'chat-window': true,
      'chat-window--painting' : isPainting,
      'hidden' : !isChatOpen
    });

    const statusClasses = classNames({
      'uncle-status' : true,
      'uncle-status--online' : isUncleOnline,
      'uncle-status--offline' : !isUncleOnline
    })

    return (
      <div className={chatClasses} id="chat-window">
        <header className="chat-header--client" onClick={(e) => stopClickThrough(e)}>
            <img src={jerryIcon} className="uncle-icon" />
            <h3 className="uncle-name">Jerry Walters</h3>
            <span className={statusClasses}></span>
        </header> 
        <div className="chat-window__content" onClick={(e) => stopClickThrough(e)}>
          { isPainting ? <Panel/> : ''}
          <div className="chat-window__chat">
            <ChatMessages messages={messages} uncleIsTyping={uncleIsTyping} />
            <ChatForm sendMessage={sendMessage} togglePainting={togglePainting} isPainting={isPainting} updateIsTyping={updateIsTyping} />
          </div>
        </div>
      </div>
    )
  }
}