import React from 'react';

const ChatMessages = ({messages}) => {
  const messageList = messages.map(
    (message, index) => <li key={index}>{message.author} : {message.message}</li>
  )

  return (
    <div>
      <ul>
        {messageList}
      </ul>
    </div>
  )
}

export default ChatMessages;
