import React, { Component } from 'react';
import classNames from 'classnames';
import ChatMessages from './ChatMessages';
import Panel from '../Panel/PanelContainer';
import ChatForm from './ChatForm'

export default class Chat extends Component {

  componentDidUpdate() {
    const messageList = document.getElementsByClassName('client-messages');
    if(messageList) {
      console.log('scroll to top')
      messageList[0].scrollTop = messageList[0].scrollHeight; 
    }
  }

  render() {
    const { sendMessage, isUncleOnline, uncleIsTyping, messages, isChatOpen, updateIsTyping, togglePainting, isPainting } = this.props;

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

    // if state isPainting is false, then don't even render the Panel
    // this is because I need to getBoundingRect of the canvas only once when its mounted
    // and it can't be mounted on initial render
    if(!isPainting) {
      return (
        <div className={chatClasses}>
          <header className="chat-header--client">
              <div className="uncle-icon"></div>
              <h3 className="uncle-name">Uncle Jerry</h3>
              <span className={statusClasses}></span>
          </header> 
          <div className="chat-window__content">
            <div className="chat-window__chat">
              <ChatMessages messages={messages} uncleIsTyping={uncleIsTyping} />
              <ChatForm sendMessage={sendMessage} togglePainting={togglePainting} isPainting={isPainting} updateIsTyping={updateIsTyping} />
            </div>
          </div>
        </div>
      )
      // otherwise, render this bad boy with the Panel in it.
    } else if (isPainting) {
        return (
          <div className={chatClasses}>
            <header className="chat-header--client">
                <div className="uncle-icon"></div>
                <h3 className="uncle-name">Uncle Jerry</h3>
                <span className={statusClasses}></span>
            </header> 
            <div className="chat-window__content">
              <Panel />
              <div className="chat-window__chat">
                <ChatMessages messages={messages} uncleIsTyping={uncleIsTyping} />
                <ChatForm sendMessage={sendMessage} togglePainting={togglePainting} isPainting={isPainting} updateIsTyping={updateIsTyping} />
              </div>
            </div>
          </div>
        )
      }
  }
}