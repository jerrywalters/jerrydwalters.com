const OPEN_PROJECT = 'OPEN_PROJECT'; 

const portfolioReducer = (state = {}, action) => {
  switch (action.type) {
    case OPEN_PROJECT:
      return Object.assign({}, state, {
        currentProject: action.project
    });
    default:
      return state;
  }
}

export default portfolioReducer;