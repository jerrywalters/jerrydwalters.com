import firebaseDb, { getUserId } from '../firebaseDb'

export const UPDATE_NEW_MESSAGE = 'UPDATE_NEW_MESSAGE'
export const ADD_MESSAGE_TO_CONVERSATION = 'ADD_MESSAGE_TO_CONVERSATION'
export const UPDATE_CONVERSATION = 'UPDATE_CONVERSATION'
export const TOGGLE_CHAT = 'TOGGLE_CHAT'
export const TOGGLE_PAINTING = 'TOGGLE_PAINTING'
export const SEND_MESSAGE = 'SEND_MESSAGE'
export const UPDATE_IS_TYPING = 'UPDATE_IS_TYPING'
export const OPEN_PROJECT = 'OPEN_PROJECT'
export const INIT_BACKGROUND = 'INIT_BACKGROUND'

export function updateNewMessage(conversationId, newMessage) {
  let convoRef = firebaseDb.ref('conversations/' + conversationId)
  convoRef.update({
    clientNewMessage: newMessage
  })
  return {
    type: UPDATE_NEW_MESSAGE
  }
}

export function openProject(projectName) {
  window.browserHistory.push(`/project/${projectName}`)
  let projects = window.projects
  return {
    type: OPEN_PROJECT,
    project: projects[projects.findIndex(project => project.name === projectName)]
  }
}

export function initBackground() {
  return {
    type: INIT_BACKGROUND
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
    type: TOGGLE_CHAT
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
  })
  return {
    type: UPDATE_IS_TYPING
  }
}

// pushes message to firebase
export function sendMessage(message) {
  let userId = getUserId()
  firebaseDb.ref('messages').push({
    message,
    author: 'client',
    conversationId: userId,
    createdOn: Date.now(),
  }, function(){
    console.log('success')
  })
  firebaseDb.ref(`conversations/${userId}`).update({
    adminNewMessage: true
  })
  return {
    type: SEND_MESSAGE
  }
}
