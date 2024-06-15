import get from 'lodash/get';
import React, {useCallback, useState} from 'react';

import {fetchShortestPaths} from '../api.ts';
import {WikipediaPage, WikipediaPageId} from '../types.ts';
import {getRandomPageTitle} from '../utils.js';
import Logo from './common/Logo';
import {ErrorMessage} from './ErrorMessage.tsx';
import {InputFlexContainer, P} from './Home.styles.ts';
import Loading from './Loading.tsx';
import {NavLinks} from './NavLinks.tsx';
import {PageInput} from './PageInput.tsx';
import {Results} from './Results.tsx';
import {SearchButton} from './SearchButton.tsx';
import {SwapInputValuesButton} from './SwapInputValuesButton.tsx';

interface ShortestPathsState {
  readonly paths: readonly WikipediaPageId[][];
  readonly pagesById: Record<WikipediaPageId, WikipediaPage>;
  readonly sourcePageTitle: string;
  readonly targetPageTitle: string;
  readonly isSourceRedirected: boolean;
  readonly isTargetRedirected: boolean;
  readonly durationInSeconds: string;
}

export const Home: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const [sourcePageTitle, setSourcePageTitle] = useState('');
  const [targetPageTitle, setTargetPageTitle] = useState('');

  const [sourcePagePlaceholderText, setSourcePagePlaceholderText] = useState(getRandomPageTitle());
  const [targetPagePlaceholderText, setTargetPagePlaceholderText] = useState(getRandomPageTitle());

  const [shortestPathsState, setShortestPathsState] = useState<ShortestPathsState | null>(null);
  const [isFetchingShortestPaths, setIsFetchingShortestPaths] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleFetchShortestPaths = useCallback(async () => {
    const startTimeInMilliseconds = Date.now();

    setIsFetchingShortestPaths(true);
    if (!sourcePageTitle) {
      setSourcePageTitle(sourcePagePlaceholderText);
    }
    if (!targetPageTitle) {
      setTargetPageTitle(targetPagePlaceholderText);
    }

    try {
      const response = await fetchShortestPaths({
        sourcePageTitle: sourcePageTitle ?? sourcePagePlaceholderText,
        targetPageTitle: targetPageTitle ?? targetPagePlaceholderText,
      });

      setShortestPathsState({
        paths: response.paths,
        pagesById: response.pagesById,
        sourcePageTitle: response.sourcePageTitle,
        targetPageTitle: response.targetPageTitle,
        isSourceRedirected: response.isSourceRedirected,
        isTargetRedirected: response.isTargetRedirected,
        durationInSeconds: ((Date.now() - startTimeInMilliseconds) / 1000).toFixed(2),
      });

      // TODO: Update the page URL, which will update the soure and target page inputs as needed.
    } catch (error) {
      if (error.message === 'Network Error') {
        // This can happen when the server is down, the Flask app is not running, or when the
        // FLASK_DEBUG environment variable is set to 1 and there is a 5xx server error (see
        // https://github.com/corydolphin/flask-cors/issues/67 for details).
        setErrorMessage(
          'Whoops... Six Degrees of Wikipedia is temporarily unavailable. Please try again in a few seconds.'
        );
      } else {
        // This can happen when there is a 4xx or 5xx error (except for the case noted in the
        // comment above).
        const defaultErrorMessage =
          'Whoops... something is broken and has been reported. In the mean time, please try a different search.';
        setErrorMessage(get(error, 'response.data.error', defaultErrorMessage));
      }
    }

    setIsFetchingShortestPaths(false);
  }, [sourcePageTitle, targetPageTitle, sourcePagePlaceholderText, targetPagePlaceholderText]);

  return (
    <div>
      <Logo />

      {/* <NavLinks handleOpenModal={handleOpenModal} /> */}

      {/* <Modal isOpen={showModal} onRequestClose={handleCloseModal}>
        <p>
          Inspired by the concept of{' '}
          <a href="https://en.wikipedia.org/wiki/Six_degrees_of_separation">
            six degrees of separation
          </a>
          , <b>Six Degrees of Wikipedia</b> traverses hyperlinks on Wikipedia to find the least
          number of clicks it takes to navigate between any of the nearly six million pages on the
          world's largest free online encyclopedia.
        </p>
        <p>
          Enter the titles of two Wikipedia pages in the boxes on this site, click the "Go!" button,
          and discover just how connected Wikipedia really is.
        </p>
        <p>
          Wikipedia is a registered trademark of the Wikimedia Foundation. This site is made by a
          fan with no affiliation to that organization.
        </p>
        <p>
          A project by <a href="https://jwn.gr/">Jacob Wenger</a>.
        </p>
      </Modal> */}

      <P>Find the shortest paths from</P>
      <InputFlexContainer>
        <PageInput
          title={sourcePageTitle}
          setTitle={setSourcePageTitle}
          placeholderText={sourcePagePlaceholderText}
          setPlaceholderText={setSourcePagePlaceholderText}
        />
        <SwapInputValuesButton
          canSwap={targetPageTitle.trim().length > 0 && sourcePageTitle.trim().length > 0}
          onClick={() => {
            setSourcePageTitle(targetPageTitle);
            setTargetPageTitle(sourcePageTitle);
          }}
        />
        <PageInput
          title={targetPageTitle}
          setTitle={setTargetPageTitle}
          placeholderText={targetPagePlaceholderText}
          setPlaceholderText={setTargetPagePlaceholderText}
        />
      </InputFlexContainer>

      <SearchButton
        sourcePageTitle={sourcePageTitle}
        targetPageTitle={targetPageTitle}
        isFetchingResults={isFetchingShortestPaths}
        fetchShortestPaths={handleFetchShortestPaths}
      />

      {errorMessage !== null ? (
        <ErrorMessage text={errorMessage} />
      ) : isFetchingShortestPaths ? (
        <Loading />
      ) : shortestPathsState ? (
        <Results
          paths={shortestPathsState.paths}
          pagesById={shortestPathsState.pagesById}
          sourcePageTitle={shortestPathsState.sourcePageTitle}
          targetPageTitle={shortestPathsState.targetPageTitle}
          isSourceRedirected={shortestPathsState.isSourceRedirected}
          isTargetRedirected={shortestPathsState.isTargetRedirected}
          durationInSeconds={shortestPathsState.durationInSeconds}
        />
      ) : (
        <ErrorMessage text="Something went wrong — no shortest paths found." />
      )}
    </div>
  );
};
