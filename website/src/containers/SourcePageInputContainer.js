import {connect} from 'react-redux';

import {setSourcePagePlaceholderText, setSourcePageTitle} from '../actions';
import PageInput from '../components/PageInput';

const mapStateToProps = ({sourcePageTitle, sourcePagePlaceholderText}) => ({
  value: sourcePageTitle,
  placeholderText: sourcePagePlaceholderText,
});

const mapDispatchToProps = (dispatch) => ({
  setPageTitle: (pageTitle) => {
    dispatch(setSourcePageTitle(pageTitle));
  },

  updateInputPlaceholderText: (inputPlaceholderText) => {
    dispatch(setSourcePagePlaceholderText(inputPlaceholderText));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(PageInput);
