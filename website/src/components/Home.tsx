import React, {useCallback, useState} from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import styled from 'styled-components';

import {fetchShortestPaths} from '../api.ts';
import {WikipediaPage, WikipediaPageId} from '../types.ts';
import {getRandomPageTitle} from '../utils.ts';
import {Button} from './common/Button.tsx';
import {Logo} from './common/Logo.tsx';
import {InputFlexContainer, Modal, P} from './Home.styles.ts';
import {Loading} from './Loading.tsx';
import {NavLinks} from './NavLinks.tsx';
import {PageInput} from './PageInput.tsx';
import {Results} from './Results.tsx';
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

const SearchButtonWrapper = styled(Button)`
  width: 240px;
  height: 72px;
  margin: 0 auto 40px;
  font-size: 32px;
  border-radius: 8px;

  @media (max-width: 600px) {
    width: 200px;
    height: 60px;
    font-size: 28px;
  }
`;

const ErrorMessageWrapper = styled.p`
  width: 700px;
  margin: 40px auto;
  font-size: 28px;
  text-align: center;
  line-height: 1.5;
  color: ${({theme}) => theme.colors.red};
  text-shadow: black 1px 1px;

  @media (max-width: 1200px) {
    width: 70%;
    font-size: 24px;
  }
`;

const ErrorMessage: React.FC<{
  readonly text: string;
}> = ({text}) => {
  const tokens = text.split('"');

  return (
    <ErrorMessageWrapper>
      {tokens.map((token, i) =>
        // Bold page titles in the provided error message.
        i % 2 === 0 ? <span key={i}>{token}</span> : <b key={i}>"{token}"</b>
      )}
    </ErrorMessageWrapper>
  );
};

export const Home: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  const [showModal, setShowModal] = useState(false);

  // Initialize the source and target page titles from the URL.
  const searchParamsFromUrl = new URLSearchParams(location.search);
  const [sourcePageTitle, setSourcePageTitle] = useState(searchParamsFromUrl.get('source') || '');
  const [targetPageTitle, setTargetPageTitle] = useState(searchParamsFromUrl.get('target') || '');

  const [sourcePagePlaceholderText, setSourcePagePlaceholderText] = useState(getRandomPageTitle());
  const [targetPagePlaceholderText, setTargetPagePlaceholderText] = useState(getRandomPageTitle());

  const [shortestPathsState, setShortestPathsState] = useState<ShortestPathsState | null>(null);
  const [isFetchingResults, setIsFetchingResults] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleFetchShortestPaths = useCallback(async () => {
    const startTimeInMilliseconds = Date.now();

    setShortestPathsState(null);
    setIsFetchingResults(true);
    setErrorMessage(null);

    const actualSourcePageTitle = sourcePageTitle || sourcePagePlaceholderText;
    const actualTargetPageTitle = targetPageTitle || targetPagePlaceholderText;

    try {
      // Update the URL to reflect the new search.
      const searchParams = new URLSearchParams();
      searchParams.set('source', actualSourcePageTitle);
      searchParams.set('target', actualTargetPageTitle);
      history.push({search: searchParams.toString()});

      const response = await fetchShortestPaths({
        sourcePageTitle: actualSourcePageTitle,
        targetPageTitle: actualTargetPageTitle,
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

      history.push({search: searchParams.toString()});
    } catch (error: unknown) {
      if ((error as Error).message === 'Network Error') {
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

        setErrorMessage((error as Error).message || defaultErrorMessage);
      }
    }

    setIsFetchingResults(false);
  }, [
    history,
    sourcePagePlaceholderText,
    sourcePageTitle,
    targetPagePlaceholderText,
    targetPageTitle,
  ]);

  return (
    <div>
      <Logo
        onClick={() => {
          // Clear page inputs.
          setSourcePageTitle('');
          setTargetPageTitle('');

          // Reset shortest paths reponse data.
          setShortestPathsState(null);
          setIsFetchingResults(false);
          setErrorMessage(null);
        }}
      />

      <NavLinks handleOpenModal={handleOpenModal} />

      <Modal isOpen={showModal} onRequestClose={handleCloseModal}>
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
      </Modal>

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

      {isFetchingResults ? null : (
        <SearchButtonWrapper
          onClick={async () => {
            if (sourcePageTitle.trim().length === 0) {
              setSourcePageTitle(sourcePagePlaceholderText);
            }
            if (targetPageTitle.trim().length === 0) {
              setTargetPageTitle(targetPagePlaceholderText);
            }

            await handleFetchShortestPaths();
          }}
        >
          Go!
        </SearchButtonWrapper>
      )}

      {errorMessage !== null ? (
        <ErrorMessage text={errorMessage} />
      ) : isFetchingResults ? (
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
      ) : null}
    </div>
  );
};
