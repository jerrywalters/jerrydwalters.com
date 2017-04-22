import React from 'react'
import classNames from 'classnames'

const ChatButton = ({ toggleChat, isChatOpen }) => {
  
  const chatIconClasses = classNames({
    'fa' : true,
    'chat-icon' : true,
    'fa-comment' : !isChatOpen,
    'fa-times' : isChatOpen
  })

  return (
    <div className="chat-button" onClick={() => toggleChat()}>
      <i className={chatIconClasses} aria-hidden="true"></i>
    </div>
  )
}

export default ChatButton