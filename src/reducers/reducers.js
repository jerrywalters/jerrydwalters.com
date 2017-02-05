import { SEND__MESSAGE, ADD__NEW__MESSAGE, ADD__UNCLE__STATUS } from '../actions'

const rootReducer = (state = {}, action) => {
  switch (action.type) {
    case ADD__NEW__MESSAGE:
      return Object.assign({}, state, {
        messages: [...state.messages, action.message]
      });
    case ADD__UNCLE__STATUS:
      return Object.assign({}, state, {
        isUncleOnline: action.isUncleOnline
      });
   default:
    return state;
  }
}

export default rootReducer;
