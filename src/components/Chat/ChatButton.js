import React from 'react'
import classNames from 'classnames'

const ChatButton = ({ toggleChat, isChatOpen, updateNewMessage, conversationId, clientNewMessage }) => {
  
  const chatIconClasses = classNames({
    'fa' : true,
    'chat-icon' : true,
    'fa-comment' : !isChatOpen,
    'fa-times' : isChatOpen
  })

  const chatButtonClasses = classNames({
    'chat-button' : true,
    'chat-button--newMessage': clientNewMessage && !isChatOpen
  })


  return (
    <div className={chatButtonClasses} 
        onClick={() => {
          toggleChat()
          updateNewMessage(conversationId, false)
        }}>
      <i className={chatIconClasses} aria-hidden="true"></i>
    </div>
  )
}

export default ChatButton