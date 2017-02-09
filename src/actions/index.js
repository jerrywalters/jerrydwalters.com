import firebaseDb, { getUserId } from '../firebaseDb';
import { fullName } from '../nameGenerator'

export const ADD__NEW__MESSAGE = 'ADD__NEW__MESSAGE';
export const ADD__UNCLE__STATUS = 'ADD__UNCLE__STATUS';

export const TOGGLE_CHAT = 'TOGGLE_CHAT';
export const SEND__MESSAGE = 'SEND__MESSAGE';

export function addNewMessage(message){
  return {
    type: ADD__NEW__MESSAGE,
    message,
  }
}

export function addUncleStatus(isUncleOnline) {
  return {
    type: ADD__UNCLE__STATUS,
    isUncleOnline
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
    type: SEND__MESSAGE
  }
}
