import firebase from 'firebase';
import { addNewMessage, addNewConversation, addUncleStatus } from './actions';
import store from './index';
import { fullName } from './nameGenerator';

// Initialize Firebase
const config = {
  apiKey: "AIzaSyA1Db7hSJ658255QfdZ09mjJR4VxcXbDP8",
  authDomain: "portfolio-chat.firebaseapp.com",
  databaseURL: "https://portfolio-chat.firebaseio.com",
  storageBucket: "portfolio-chat.appspot.com",
  messagingSenderId: "892675563096"
};

firebase.initializeApp(config);

// Database stuff
const db = firebase.database();

// db.ref('conversations')
//   .on('child_added', function(data) {
//     const conversation = data.val();
//     const conversationId = conversation.conversationId;
//     store.dispatch(addNewConversation(conversation));
//   });

function uid(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  });
}

// generate a name for this fucker
const name = fullName();

export function getUserId(){
  var userId = '';
  // get and or set user
  if(localStorage.user){
    var userId = localStorage.user;
    // firebase.database().ref('conversations/' + userId).set({
    //   conversationId: userId
    // });
  } else {
    userId = uid();
    localStorage.user = userId;
    console.log('created new user');
    firebase.database().ref('conversations/' + userId).set({
      conversationId: userId,
      name: name,
      createdOn: Date.now(),
      lastChat: Date.now()
    });
  }
  return userId;
}

let userId = getUserId();

checkOnline(userId);

function checkOnline(conversationId) {
  let convoRef = db.ref('conversations/' + conversationId);
  convoRef.update({
    isNephewOnline: true
  })
  convoRef.onDisconnect().update({
    isNephewOnline: false
  });
}

// set isUncleOnline state
function setUncleOnline(data) {
  const conversation = data.val();
  let isUncleOnline = conversation.isUncleOnline;
  store.dispatch(addUncleStatus(isUncleOnline));
}

// set isUncleOnline state on load
db.ref('conversations/').limitToLast(1).on('child_added', function(data) {
  setUncleOnline(data);
  console.log('uncle is coming online');
});

// set isUncleOnline state whenever it changes in db
db.ref('conversations/').limitToLast(1).on('child_changed', function(data) {
  setUncleOnline(data);
  console.log('uncle is coming online');
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
    store.dispatch(addNewMessage(message));

   });

export default db;
