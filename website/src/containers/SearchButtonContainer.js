import {connect} from 'react-redux';

import SearchButton from '../components/SearchButton';

import {fetchShortestPaths} from '../actions';

const mapStateToProps = ({isFetchingResults}) => ({isFetchingResults});

const mapDispatchToProps = (dispatch) => ({
  fetchShortestPaths: () => dispatch(fetchShortestPaths()),
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchButton);
