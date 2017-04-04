import firebase from 'firebase';
import { addMessageToConversation, updateConversation } from './actions';
import store from './index';

import { fullName } from './utils/nameGenerator';
import { getRandomInt } from './utils/utils'


// Initialize Firebase
const config = {
  apiKey: "AIzaSyA1Db7hSJ658255QfdZ09mjJR4VxcXbDP8",
  authDomain: "portfolio-chat.firebaseapp.com",
  databaseURL: "https://portfolio-chat.firebaseio.com",
  storageBucket: "portfolio-chat.appspot.com",
  messagingSenderId: "892675563096"
};

firebase.initializeApp(config);
const db = firebase.database();

// generate a name for this fucker
const name = fullName();
let userId = getUserId();

db.ref(`conversations/${userId}`).on('value', function(data) {
  const conversationId = data.val().conversationId;
  const isUncleOnline = data.val().isUncleOnline;
  const uncleIsTyping = data.val().uncleIsTyping;
  const lastChat = data.val().lastChat;
  const conversation = {
    conversationId,
    isUncleOnline,
    uncleIsTyping,
    lastChat
  };
  store.dispatch(updateConversation(conversation));
});

db.ref('messages')
  .orderByChild('conversationId')
  .equalTo(userId)
  .on('child_added', function(data) {
    const message = data.val();
    let convoRef = db.ref('conversations/' + userId);
    convoRef.update({
      lastChat: Date.now()
    })
    store.dispatch(addMessageToConversation(message));

   });

checkOnline(userId);

function checkOnline(conversationId) {
  let convoRef = db.ref(`conversations/${conversationId}`);
  convoRef.update({
    isNephewOnline: true
  })
  convoRef.onDisconnect().update({
    isNephewOnline: false
  });
}

// db.ref('conversations')
//   .on('child_added', function(data) {
//     const conversation = data.val();
//     const conversationId = conversation.conversationId;
//     store.dispatch(addNewConversation(conversation));
//   });

function uid(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  });
}

export function getUserId(){
  let userId = '';
  let identity = '1';
  // get and or set user
  if(localStorage.jerryPortfolioUser){
    userId = localStorage.jerryPortfolioUser;
    db.ref(`conversations/${userId}`).update({
      conversationId: userId,
    });
  } else {
    identity = getRandomInt(1, 6);
    userId = uid();
    
    localStorage.jerryPortfolioUser = userId;
    db.ref(`conversations/${userId}`).update({
      conversationId: userId,
      identity,
      createdOn: Date.now(),
      name: name
    });
  }
  return userId;
}

// set isUncleOnline state

// set isUncleOnline state on load
// db.ref('conversations/').limitToLast(1).on('child_added', function(data) {
//   setUncleOnline(data);
// });

// set isUncleOnline state whenever it changes in db


export default db;
