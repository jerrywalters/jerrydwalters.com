import { SEND_MESSAGE, 
         ADD_MESSAGE_TO_CONVERSATION,
         ADD_UNCLE_STATUS,
         TOGGLE_CHAT
        } from '../actions'

const OPEN_PROJECT = 'OPEN_PROJECT';

const rootReducer = (state = {}, action) => {
  switch (action.type) {
    case TOGGLE_CHAT:
    return Object.assign({}, state, {
      chat: {
        isChatOpen: !state.chat.isChatOpen,
      }
    });
    case ADD_MESSAGE_TO_CONVERSATION:
      return Object.assign({}, state, {
        messages: [...state.messages, action.message]
      });
    case OPEN_PROJECT:
      return Object.assign({}, state, {
        currentProject: action.project
      })
    case ADD_UNCLE_STATUS:
      return Object.assign({}, state, {
        uncleIsTyping: action.uncleIsTyping,
        isUncleOnline: action.isUncleOnline
      });
   default:
    return state;
  }
}

export default rootReducer;
