import {connect} from 'react-redux';

import {setErrorMessage, setIsFetchingResults, setShortestPathResults} from '../actions';

import SearchButton from '../components/SearchButton';

const mapStateToProps = (state) => {
  return {
    toArticleTitle: state.toArticleTitle,
    fromArticleTitle: state.fromArticleTitle,
    isFetchingResults: state.isFetchingResults,
  };
};

const mapDispatchToProps = (dispatch, state) => {
  return {
    setShortestPathResults: (paths) => {
      dispatch(setShortestPathResults(paths));
    },
    setErrorMessage: (errorMessage) => {
      dispatch(setErrorMessage(errorMessage));
    },
    setIsFetchingResults: (isFetchingResults) => {
      dispatch(setIsFetchingResults(isFetchingResults));
    },
  };
};

const SearchButtonContainer = connect(mapStateToProps, mapDispatchToProps)(SearchButton);

export default SearchButtonContainer;
