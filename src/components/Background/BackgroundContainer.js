import { connect } from 'react-redux';
import { initBackground } from '../../actions';
import Background from './Background';

const mapStateToProps = (state) => {
  return {
    shapesGenerated: state.portfolio.shapesGenerated,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    initBackground: () => {
      dispatch(initBackground());
    }
  };
};

const BackgroundContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Background);

export default BackgroundContainer;