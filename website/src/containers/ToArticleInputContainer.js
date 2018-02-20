import {connect} from 'react-redux';

import {setToArticleTitle} from '../actions';

import ArticleInput from '../components/ArticleInput';

const mapStateToProps = (state) => {
  return {
    value: state.toArticleTitle,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setArticleTitle: (articleTitle) => {
      dispatch(setToArticleTitle(articleTitle));
    },
  };
};

const ToArticleInputContainer = connect(mapStateToProps, mapDispatchToProps)(ArticleInput);

export default ToArticleInputContainer;
