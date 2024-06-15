import {connect} from 'react-redux';
import {fetchShortestPaths} from '../actions';
import SearchButton from '../components/SearchButton';

const mapStateToProps = ({isFetchingResults}) => ({isFetchingResults});

const mapDispatchToProps = (dispatch) => ({
  fetchShortestPaths: () => dispatch(fetchShortestPaths()),
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchButton);
