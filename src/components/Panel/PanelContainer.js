import { connect } from 'react-redux';
import { sendMessage } from '../../actions/';
import Panel from './Panel';

const mapStateToProps = (state) => {
  return {
    isDrawing: state.portfolio.isDrawing,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    sendMessage: (msg) => {
      dispatch(sendMessage(msg));
    },
  };
};

const PanelContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Panel);

export default PanelContainer;