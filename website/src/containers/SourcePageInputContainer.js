import {connect} from 'react-redux';

import {setSourcePageTitle} from '../actions';

import PageInput from '../components/PageInput';

const mapStateToProps = ({sourcePageTitle}) => ({
  value: sourcePageTitle,
});

const mapDispatchToProps = (dispatch) => ({
  setPageTitle: (pageTitle) => {
    dispatch(setSourcePageTitle(pageTitle));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(PageInput);
