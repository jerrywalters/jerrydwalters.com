import { connect } from 'react-redux';
import Chat from './Chat';

import { sendMessage, toggleChat, updateIsTyping } from '../../actions'

const mapStateToProps = (state) => {
  return {
    isChatOpen: state.chat.isChatOpen,
    messages: state.chat.conversation.messages,
    isUncleOnline: state.chat.conversation.isUncleOnline,
    uncleIsTyping: state.chat.conversation.uncleIsTyping
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    sendMessage: (message) => {
      dispatch(sendMessage(message));
    },
    updateIsTyping: typing => {
      dispatch(updateIsTyping(typing));
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
