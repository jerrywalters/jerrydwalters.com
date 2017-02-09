import React from 'react';

const ChatButton = ({ toggleChat }) =>  {

  return (
    <div className="chat-button" onClick={() => toggleChat()}>
    </div>
  );
}

export default ChatButton;