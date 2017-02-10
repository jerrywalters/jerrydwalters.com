import { connect } from 'react-redux';
import Project from './Project';

const mapStateToProps = (state) => {
  return {
    project: state.currentProject,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
  };
};

const ProjectContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Project);

export default ProjectContainer;
