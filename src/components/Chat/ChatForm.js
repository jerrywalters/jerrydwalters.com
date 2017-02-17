import React from 'react';

const ChatForm = ({ sendMessage, togglePainting, isPainting, updateIsTyping}) => {
  let isTypingTimeout;

  function formSubmit(inputText){
    let text = inputText.trim();
    if(!text || text === ' ') {
    } else {
    sendMessage(text);
    }
  }

  function submitByIcon(e) {
    const input = document.getElementById('chat__input');
    formSubmit(input.innerText);
    input.innerHTML = '';
    e.preventDefault();
  }

  function isClientTyping() {
    if (isTypingTimeout !== undefined) clearTimeout(isTypingTimeout);
    updateIsTyping(true);
    isTypingTimeout = setTimeout(function() {
      updateIsTyping(false);
    }, 2000);
  }

  function handleTyping(e) {
    const keyCode = e.keyCode;
    if (keyCode == 13 && e.shiftKey) {
    } else if (keyCode == 13) {
    const input = document.getElementById('chat__input');
    formSubmit(input.innerText);
    input.innerHTML = '';
    e.preventDefault();
    }
  }

  function attachImage(){
    var file    = document.getElementById('chat-form__file').files[0];
    var reader  = new FileReader();
    console.log('attaching image')
    reader.addEventListener("load", function () {
      sendMessage(reader.result);
    }, false);

    if (file) {
      reader.readAsDataURL(file);
    }
  }

  return (
    <form className="chat-form chat-form--client">
        <div contentEditable="true" 
            placeholder="message uncle" 
            className="chat-form__input" 
            id="chat__input" 
            onKeyDown={(e) => handleTyping(e)}
            onKeyPress={() => isClientTyping()}>
        </div>
        <div className="chat-form__paint" onClick={() => togglePainting()}>
        paint 
        </div>
        <div className="chat-form__attachment" onClick={() => attachImage()}>attach</div>
        <input className="chat-form__file" id="chat-form__file" onChange={() => attachImage()} type="file"></input>
        <input className="chat-form__submit" 
                type="submit" 
                onClick={ (e) => submitByIcon(e)}>
        </input>
    </form>
  )
}

export default ChatForm;