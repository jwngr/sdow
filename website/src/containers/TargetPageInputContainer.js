import {connect} from 'react-redux';

import {setTargetPageTitle, setTargetPagePlaceholderText} from '../actions';

import PageInput from '../components/PageInput';

const mapStateToProps = ({targetPageTitle, targetPagePlaceholderText}) => ({
  value: targetPageTitle,
  placeholderText: targetPagePlaceholderText,
});

const mapDispatchToProps = (dispatch) => ({
  setPageTitle: (pageTitle) => {
    dispatch(setTargetPageTitle(pageTitle));
  },

  updateInputPlaceholderText: (inputPlaceholderText) => {
    dispatch(setTargetPagePlaceholderText(inputPlaceholderText));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(PageInput);
