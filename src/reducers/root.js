// Root Reducer
import { combineReducers } from 'redux'

// Import Reducers
import portfolio from './portfolioReducers'
import chat from './chatReducers'

// Combine all reducers into one root reducer
export default combineReducers({
  portfolio,
  chat
})