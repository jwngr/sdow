import {connect} from 'react-redux';
import {ErrorMessage} from '../components/ErrorMessage.tsx';

const mapStateToProps = ({errorMessage}) => ({errorMessage});

export default connect(mapStateToProps)(ErrorMessage);
