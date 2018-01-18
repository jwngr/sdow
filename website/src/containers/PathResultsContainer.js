import {connect} from 'react-redux';

import PathResults from '../components/PathResults';

const mapStateToProps = (state) => {
  return {
    paths: state.paths,
  };
};

const PathResultsContainer = connect(mapStateToProps)(PathResults);

export default PathResultsContainer;
