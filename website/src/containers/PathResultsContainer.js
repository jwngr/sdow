import {connect} from 'react-redux';

import PathResults from '../components/PathResults';

const mapStateToProps = ({results}) => {
  if (results === null) {
    return {
      paths: null,
    };
  }

  return {
    paths: results.paths,
    sourcePageTitle: results.sourcePageTitle,
    targetPageTitle: results.targetPageTitle,
  };
};

const PathResultsContainer = connect(mapStateToProps)(PathResults);

export default PathResultsContainer;
