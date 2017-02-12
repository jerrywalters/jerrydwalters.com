import firebaseDb, { getUserId } from '../firebaseDb';
import { fullName } from '../nameGenerator'

export const ADD_MESSAGE_TO_CONVERSATION = 'ADD_MESSAGE_TO_CONVERSATION';
export const ADD_UNCLE_STATUS = 'ADD_UNCLE_STATUS';

export const TOGGLE_CHAT = 'TOGGLE_CHAT';
export const SEND_MESSAGE = 'SEND_MESSAGE';
export const UPDATE_IS_TYPING = 'UPDATE_IS_TYPING';

export function addMessageToConversation(message){
  return {
    type: ADD_MESSAGE_TO_CONVERSATION,
    message,
  }
}

export function addUncleStatus(isUncleOnline, uncleIsTyping) {
  return {
    type: ADD_UNCLE_STATUS,
    isUncleOnline, 
    uncleIsTyping
  }
}

export function updateIsTyping(typing){
  firebaseDb.ref(`conversations/${getUserId()}`).update({
    clientIsTyping: typing
  });
  return {
    type: UPDATE_IS_TYPING,
  }
}

export function toggleChat() {
  return {
    type: TOGGLE_CHAT,
  }
}

// pushes message to firebase
export function sendMessage(message) {
  firebaseDb.ref('messages').push({
    message,
    author: 'client',
    conversationId: getUserId(),
    createdOn: Date.now(),
  }, function(){
    console.log('success');
  })
  return {
    type: SEND_MESSAGE
  }
}
