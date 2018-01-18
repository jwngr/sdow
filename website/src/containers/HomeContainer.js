import {connect} from 'react-redux';

import {setToArticleTitle, setFromArticleTitle} from '../actions';

import Home from '../components/Home';

const mapStateToProps = (state) => {
  return {
    paths: state.paths,
    error: state.error,
  };
};

const HomeContainer = connect(mapStateToProps)(Home);

export default HomeContainer;
