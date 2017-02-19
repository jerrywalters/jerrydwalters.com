import firebaseDb, { getUserId } from '../firebaseDb';
import { fullName } from '../nameGenerator'

export const ADD_MESSAGE_TO_CONVERSATION = 'ADD_MESSAGE_TO_CONVERSATION';
export const UPDATE_CONVERSATION = 'UPDATE_CONVERSATION';
export const TOGGLE_CHAT = 'TOGGLE_CHAT';
export const TOGGLE_PAINTING = 'TOGGLE_PAINTING';
export const SEND_MESSAGE = 'SEND_MESSAGE';
export const UPDATE_IS_TYPING = 'UPDATE_IS_TYPING';
export const OPEN_PROJECT = 'OPEN_PROJECT';

export function openProject(projectName) {
  window.browserHistory.push(`/project/${projectName}`)
  let projects = window.projects;
  return {
    type: OPEN_PROJECT,
    project: projects[projects.findIndex(project => project.name === projectName)]
  }
}

export function addMessageToConversation(message){
  return {
    type: ADD_MESSAGE_TO_CONVERSATION,
    message,
  }
}

export function updateConversation(conversation) {
  return {
    type: UPDATE_CONVERSATION,
    conversation
  }
}

export function toggleChat() {
  return {
    type: TOGGLE_CHAT,
  }
}

export function togglePainting() {
  return {
    type: TOGGLE_PAINTING
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
