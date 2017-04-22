import { connect } from 'react-redux'
import { sendMessage, togglePainting} from '../../actions/'
import Panel from './Panel'

const mapStateToProps = (state) => {
  return {
    isPainting: state.chat.isPainting,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    sendMessage: (msg) => {
      dispatch(sendMessage(msg))
    },
    togglePainting: () => {
      dispatch(togglePainting())
    },
  }
}

const PanelContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Panel)

export default PanelContainer