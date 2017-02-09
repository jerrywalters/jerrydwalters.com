import { connect } from 'react-redux';
import { toggleChat } from '../actions';
import ChatButton from './ChatButton';

const mapStateToProps = (state) => {
  return {
    isChatOpen: state.chat.isChatOpen,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleChat: () => {
      dispatch(toggleChat());
    }
  };
};

const ChatButtonContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ChatButton);

export default ChatButtonContainer;