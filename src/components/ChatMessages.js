import React from 'react';

const ChatMessages = ({messages}) => {
  const messageList = messages.map(
    (message, index) => <li className={`client-messages__item client-messages__item--${message.author}`} key={index}>{message.message}</li>
  )

  return (
    <div className="messages-container">
      <ul className="client-messages">
        {messageList}
      </ul>
    </div>
  )
}

export default ChatMessages;
