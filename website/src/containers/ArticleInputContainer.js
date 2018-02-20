import {connect} from 'react-redux';

import {setToArticleTitle, setFromArticleTitle} from '../actions';

import ArticleInput from '../components/ArticleInput';

const mapStateToProps = (state) => {
  return {
    toArticleTitle: state.toArticleTitle,
    fromArticleTitle: state.fromArticleTitle,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setArticleTitle: (toOrFrom, articleTitle) => {
      if (toOrFrom === 'to') {
        dispatch(setToArticleTitle(articleTitle));
      } else {
        dispatch(setFromArticleTitle(articleTitle));
      }
    },
  };
};

const ArticleInputContainer = connect(mapStateToProps, mapDispatchToProps)(ArticleInput);

export default ArticleInputContainer;
