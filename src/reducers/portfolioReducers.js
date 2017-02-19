import { INIT_BACKGROUND } from '../actions'
const OPEN_PROJECT = 'OPEN_PROJECT'; 

const portfolioReducer = (state = {}, action) => {
  switch (action.type) {
    case OPEN_PROJECT:
      return Object.assign({}, state, {
        currentProject: action.project
      });
    case  INIT_BACKGROUND:
      return Object.assign({}, state, {
        shapesGenerated: true
      });
    default:
      return state;
  }
}

export default portfolioReducer;