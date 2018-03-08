import {connect} from 'react-redux';

import {setSourcePageTitle, setTargetPageTitle} from '../actions';

import SwapInputValuesButton from '../components/SwapInputValuesButton';

const mapStateToProps = ({sourcePageTitle, targetPageTitle}) => ({
  sourcePageTitle,
  targetPageTitle,
});

const mapDispatchToProps = (dispatch) => ({
  swapPageTitles: (sourcePageTitle, targetPageTitle) => {
    dispatch(setSourcePageTitle(sourcePageTitle));
    dispatch(setTargetPageTitle(targetPageTitle));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SwapInputValuesButton);
