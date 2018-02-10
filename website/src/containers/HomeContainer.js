import {connect} from 'react-redux';

import Home from '../components/Home';

const mapStateToProps = (state) => {
  return {
    error: state.error,
    isFetchingResults: state.isFetchingResults,
  };
};

const HomeContainer = connect(mapStateToProps)(Home);

export default HomeContainer;
