import {connect} from 'react-redux';

import Loading from '../components/Loading';

const mapStateToProps = ({isFetchingResults}) => ({isFetchingResults});

export default connect(mapStateToProps)(Loading);
