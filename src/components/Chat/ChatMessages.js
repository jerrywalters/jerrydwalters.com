import React from 'react';
import classNames from 'classnames';

const ChatMessages = ({messages, uncleIsTyping}) => {
  const isTypingClasses = classNames({
    'client-messages__item--isTyping' : uncleIsTyping,
    'client-messages__item--notTyping' :  !uncleIsTyping
  })  

  const messageList = messages.map(
    (message, index) => <li className={`client-messages__item client-messages__item--${message.author}`} key={index}>{message.message}</li>
  )

  return (
    <div className="messages-container">
      <ul className="client-messages">
        {messageList}
        <li className={isTypingClasses}>
            <span></span>
            <span></span>
            <span></span>
        </li>
      </ul>
    </div>
  )
}

export default ChatMessages;
