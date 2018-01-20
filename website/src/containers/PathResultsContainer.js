import {connect} from 'react-redux';

import PathResults from '../components/PathResults';

const mapStateToProps = ({paths, pages}) => {
  return {
    paths,
    pages,
  };
};

const PathResultsContainer = connect(mapStateToProps)(PathResults);

export default PathResultsContainer;
