import {connect} from 'react-redux';

import {setError, setShortestPathResults} from '../actions';

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
    setError: (errorMessage) => {
      dispatch(setError(errorMessage));
    },
  };
};

const SearchButtonContainer = connect(mapStateToProps, mapDispatchToProps)(SearchButton);

export default SearchButtonContainer;
