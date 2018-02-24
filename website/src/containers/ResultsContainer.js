import {connect} from 'react-redux';

import Results from '../components/Results';

const mapStateToProps = ({results, isFetchingResults}) => ({
  results,
  isFetchingResults,
});

export default connect(mapStateToProps)(Results);
