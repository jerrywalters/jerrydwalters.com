import { connect } from 'react-redux'
import Project from './Project'

import { openProject } from '../../actions'

const mapStateToProps = (state) => {
  return {
    project: state.portfolio.currentProject,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    openProject: (project) => {
      dispatch(openProject(project))
    },
  }
}

const ProjectContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Project)

export default ProjectContainer
