import { connect } from 'react-redux'
import { toggleChat, updateNewMessage } from '../../actions'
import ChatButton from './ChatButton'

const mapStateToProps = (state) => {
  return {
    isChatOpen: state.chat.isChatOpen,
    clientNewMessage: state.chat.conversation.clientNewMessage,
    conversationId: state.chat.conversation.conversationId
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    toggleChat: () => {
      dispatch(toggleChat())
    },
    updateNewMessage: (conversationId, newMessage) => {
      dispatch(updateNewMessage(conversationId, newMessage))
    }
  }
}

const ChatButtonContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ChatButton)

export default ChatButtonContainer