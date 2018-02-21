import {connect} from 'react-redux';

import {setSourcePageTitle} from '../actions';

import PageInput from '../components/PageInput';

const mapStateToProps = (state) => {
  return {
    value: state.sourcePageTitle,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setPageTitle: (pageTitle) => {
      dispatch(setSourcePageTitle(pageTitle));
    },
  };
};

const FromPageInputContainer = connect(mapStateToProps, mapDispatchToProps)(PageInput);

export default FromPageInputContainer;
