import {connect} from 'react-redux';

import Results from '../components/Results';

const mapStateToProps = ({results}) => results;

export default connect(mapStateToProps)(Results);
