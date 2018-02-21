import {connect} from 'react-redux';

import {setTargetPageTitle} from '../actions';

import PageInput from '../components/PageInput';

const mapStateToProps = (state) => {
  return {
    value: state.targetPageTitle,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setPageTitle: (pageTitle) => {
      dispatch(setTargetPageTitle(pageTitle));
    },
  };
};

const FromPageInputContainer = connect(mapStateToProps, mapDispatchToProps)(PageInput);

export default FromPageInputContainer;
