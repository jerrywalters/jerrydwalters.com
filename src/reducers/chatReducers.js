import { 
         ADD_MESSAGE_TO_CONVERSATION,
         UPDATE_CONVERSATION,
         TOGGLE_CHAT,
         TOGGLE_PAINTING
        } from '../actions'

const chatReducer = (state = {}, action) => {
  switch (action.type) {
    case TOGGLE_CHAT:
      return Object.assign({}, state, {
          isChatOpen: !state.isChatOpen,
      });
    case TOGGLE_PAINTING:
      return Object.assign({}, state, {
        isPainting: !state.isPainting
      });
    case ADD_MESSAGE_TO_CONVERSATION:
      return Object.assign({}, state, {
        conversation:
          Object.assign({}, state.conversation, {
            messages: [...state.conversation.messages, action.message]
          })
      });
    case UPDATE_CONVERSATION:
      return Object.assign({}, state, {
        conversation: {
          uncleIsTyping: action.conversation.uncleIsTyping,
          isUncleOnline: action.conversation.isUncleOnline,
          lastChat: action.conversation.lastChat,
          messages: state.conversation.messages
        }
      });
   default:
    return state;
  }
}

export default chatReducer;
