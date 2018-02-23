import {connect} from 'react-redux';

import PathResults from '../components/PathResults';

const mapStateToProps = ({results}) => results;

export default connect(mapStateToProps)(PathResults);
