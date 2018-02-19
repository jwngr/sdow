import {connect} from 'react-redux';

import {setErrorMessage, setIsFetchingResults, setShortestPathResults} from '../actions';

import SearchButton from '../components/SearchButton';

const mapStateToProps = (state) => {
  return {
    toArticleTitle: state.toArticleTitle,
    fromArticleTitle: state.fromArticleTitle,
  };
};

const mapDispatchToProps = (dispatch) => {
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
