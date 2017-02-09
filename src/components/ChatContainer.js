import { connect } from 'react-redux';
import Chat from './Chat';

import { sendMessage, toggleChat } from '../actions'

const mapStateToProps = (state) => {
  return {
    isChatOpen: state.chat.isChatOpen,
    messages: state.messages,
    isUncleOnline: state.isUncleOnline
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    sendMessage: (message) => {
      dispatch(sendMessage(message));
    },
    toggleChat: () => {
      dispatch(toggleChat());
    }
  }
}

const ChatContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Chat)

export default ChatContainer

// TODO: refactor this shit into the right directory structure. /components/babycontainer
