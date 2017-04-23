import React from 'react'
import className from 'classnames'

const ChatForm = ({ sendMessage, togglePainting, isPainting, updateIsTyping}) => {
  let isTypingTimeout

  function formSubmit(inputText){
    let text = inputText.trim()
    if(!text || text === ' ') {
    } else {
      sendMessage(text)
      // tell admin that you're not typing anymore so message doesn't stack
      updateIsTyping(false)
    }
  }

  function submitByIcon(e) {
    const input = document.getElementById('chat__input')

    formSubmit(input.innerText)
    input.innerHTML = ''
    e.preventDefault()
  }

  function isClientTyping() {
    if (isTypingTimeout !== undefined) clearTimeout(isTypingTimeout)

    updateIsTyping(true)
    isTypingTimeout = setTimeout(function() {
      updateIsTyping(false)
    }, 2000)
  }

  function handleTyping(e) {
    const keyCode = e.keyCode

    if (keyCode === 13 && e.shiftKey) {
    } else if (keyCode === 13) {
      const input = document.getElementById('chat__input')
      formSubmit(input.innerText)
      input.innerHTML = ''
      e.preventDefault()
    }
  }

  function attachImage(){
    var file    = document.getElementById('chat-form__file').files[0]
    var reader  = new FileReader()
    
    reader.addEventListener("load", function () {
      sendMessage(reader.result)
    }, false)

    if (file) {
      reader.readAsDataURL(file)
    }
  }

  // insurance to make sure you can't open painting on mobile
  // nevermind, this obviously runs once
  // so if you stretch from a small screen then it no longer works
  // function handlePainting() {
  //   if (width < 650) {
  //     return
  //   }
  //   togglePainting()
  // }

  const paintingIconClasses = className({
    'fa': true,
    'fa-paint-brush': true,
    'fa-paint-brush-gray': isPainting
  })

  return (
    <form className="chat-form chat-form--client">
        <div contentEditable="true" 
            placeholder="message uncle" 
            className="chat-form__input" 
            id="chat__input" 
            onKeyDown={(e) => handleTyping(e)}
            onKeyPress={() => isClientTyping()}>
        </div>
        <div className="chat-form__actions">
          <div className="chat-form__icon chat-form__icon--painting" onClick={() => togglePainting()}>
            <i className={paintingIconClasses} aria-hidden="true"></i> 
          </div>
          <label className="chat-form__icon">
            <i className="fa fa-paperclip" aria-hidden="true"></i>
            <input className="chat-form__file" id="chat-form__file" onChange={() => attachImage()} type="file"></input>
          </label>
          <div className="chat-form__icon" 
                  type="submit" 
                  onClick={ (e) => submitByIcon(e)}>
                  <i className="fa fa-paper-plane-o" aria-hidden="true"></i>
          </div>
        </div>
    </form>
  )
}

export default ChatForm