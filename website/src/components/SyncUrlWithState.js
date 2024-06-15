import {useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory, useLocation} from 'react-router-dom';
import {setSourcePageTitle, setTargetPageTitle} from '../actions';

export const SyncUrlWithState = () => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const sourcePageTitleFromState = useSelector((state) => state.sourcePageTitle);
  const targetPageTitleFromState = useSelector((state) => state.targetPageTitle);

  const sourcePageTitleFromUrl = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('source');
  }, [location.search]);

  const targetPageTitleFromUrl = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('target');
  }, [location.search]);

  const sourceIsSynced = sourcePageTitleFromState === sourcePageTitleFromUrl;
  const targetIsSynced = targetPageTitleFromState === targetPageTitleFromUrl;

  // Update URL when state changes.
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (sourcePageTitleFromState && !sourceIsSynced) {
      searchParams.set('source', sourcePageTitleFromState);
    }
    if (targetPageTitleFromState && !targetIsSynced) {
      searchParams.set('target', targetPageTitleFromState);
    }
    history.push({search: searchParams.toString()});
  }, [
    location.search,
    sourceIsSynced,
    sourcePageTitleFromState,
    targetIsSynced,
    targetPageTitleFromState,
    history,
  ]);

  // Update state when URL changes.
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const source = searchParams.get('source');
    const target = searchParams.get('target');

    if (sourcePageTitleFromUrl && !sourceIsSynced) {
      dispatch(setSourcePageTitle(source));
    }
    if (targetPageTitleFromUrl && !targetIsSynced) {
      dispatch(setTargetPageTitle(target));
    }
  }, [
    location.search,
    dispatch,
    sourceIsSynced,
    sourcePageTitleFromState,
    targetIsSynced,
    targetPageTitleFromState,
  ]);

  return null; // This component does not render anything
};
