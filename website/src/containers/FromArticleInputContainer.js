import {connect} from 'react-redux';

import {setFromArticleTitle} from '../actions';

import ArticleInput from '../components/ArticleInput';

const mapStateToProps = (state) => {
  return {
    value: state.fromArticleTitle,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setArticleTitle: (articleTitle) => {
      dispatch(setFromArticleTitle(articleTitle));
    },
  };
};

const FromArticleInputContainer = connect(mapStateToProps, mapDispatchToProps)(ArticleInput);

export default FromArticleInputContainer;
