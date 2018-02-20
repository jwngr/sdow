import {connect} from 'react-redux';

import Loading from '../components/Loading';

const mapStateToProps = (state) => {
  return {
    isFetchingResults: state.isFetchingResults,
  };
};

const LoadingContainer = connect(mapStateToProps)(Loading);

export default LoadingContainer;
