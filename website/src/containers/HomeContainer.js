import {connect} from 'react-redux';

import {fetchShortestPaths} from '../actions';

import Home from '../components/Home';

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch, state) => {
  return {
    fetchShortestPaths: () => dispatch(fetchShortestPaths()),
  };
};

const HomeContainer = connect(mapStateToProps, mapDispatchToProps)(Home);

export default HomeContainer;
