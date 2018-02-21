import {connect} from 'react-redux';

import {setErrorMessage, setIsFetchingResults, setShortestPathResults} from '../actions';

import SearchButton from '../components/SearchButton';

const mapStateToProps = (state) => {
  return {
    sourcePageTitle: state.sourcePageTitle,
    targetPageTitle: state.targetPageTitle,
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
