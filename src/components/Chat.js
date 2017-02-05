import React from 'react';
import classNames from 'classnames';
import ChatMessages from './ChatMessages';

const Chat = ({ sendMessage, messages, isUncleOnline }) => {
  // sets message to input value and sends it
  function formSubmit(e){
    e.preventDefault();
    const input = document.getElementById('chat__input').value;
    console.log('input : ', input)
    sendMessage(input);
    document.getElementById('chat__input').value = '';
  }
  return (
    <div className="chat-window">
      <p>online:{(isUncleOnline === true) ? 'online' : 'offline'}</p>
      <form onSubmit={(e) => formSubmit(e)}>
        <input id="chat__input" type="text"></input>
        <input type="submit" ></input>
      </form>
      <ChatMessages messages={messages}/>
    </div>
)}

export default Chat;
