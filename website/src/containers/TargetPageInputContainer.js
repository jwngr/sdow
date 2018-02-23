import {connect} from 'react-redux';

import {setTargetPageTitle} from '../actions';

import PageInput from '../components/PageInput';

const mapStateToProps = ({targetPageTitle}) => ({
  value: targetPageTitle,
});

const mapDispatchToProps = (dispatch) => ({
  setPageTitle: (pageTitle) => {
    dispatch(setTargetPageTitle(pageTitle));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(PageInput);
