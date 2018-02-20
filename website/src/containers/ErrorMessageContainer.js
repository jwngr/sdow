import {connect} from 'react-redux';

import ErrorMessage from '../components/ErrorMessage';

const mapStateToProps = (state) => {
  return {
    errorMessage: state.errorMessage,
  };
};

const ErrorMessageContainer = connect(mapStateToProps)(ErrorMessage);

export default ErrorMessageContainer;
