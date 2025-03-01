import React from 'react';
import styled from 'styled-components';

import {WikipediaPage, WikipediaPageId} from '../types';
import {getNumberWithCommas, getWikipediaPageUrl} from '../utils';
import {Button} from './common/Button';
import {StyledTextLink} from './common/StyledTextLink';
import {ResultsGraph} from './ResultsGraph';
import {ResultsList} from './ResultsList';

const ResultsMessage = styled.div`
  width: 800px;
  margin: 32px auto 20px auto;
  text-align: center;

  & > p {
    font-size: 28px;
    line-height: 1.5;
    margin-bottom: 12px;
    color: ${({theme}) => theme.colors.darkGreen};
  }

  @media (max-width: 1200px) {
    width: 70%;

    & > p {
      font-size: 24px;
    }
  }
`;

const TwitterButtonWrapper = styled.a`
  width: 200px;
  display: block;
  margin: 20px auto 32px auto;
  text-decoration: none;
`;

const TwitterButton = styled(Button)`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 12px;
  font-size: 20px;
`;

const TwitterBirdSvg = styled.svg`
  width: 40px;
  height: 40px;
  margin-right: 4px;
`;

/**
 * Adds some character to the results by rendering a snarky comment for certain degress of
 * separation.
 */
const SnarkyContent: React.FC<{readonly degreesOfSeparation: number}> = ({degreesOfSeparation}) => {
  if (degreesOfSeparation >= 2 && degreesOfSeparation <= 4) {
    return null;
  }

  let snarkyContent: React.ReactNode;
  if (degreesOfSeparation === 0) {
    snarkyContent = (
      <>
        <b>Seriously?</b> Talk about overqualified for the job...
      </>
    );
  } else if (degreesOfSeparation === 1) {
    snarkyContent = <>Thanks for making my job easy...</>;
  } else if (degreesOfSeparation === 5) {
    snarkyContent = (
      <>
        <b>*wipes brow*</b> I really had to work for this one.
      </>
    );
  } else if (degreesOfSeparation === 6) {
    snarkyContent = (
      <>
        <b>*breathes heavily*</b> What a workout!
      </>
    );
  } else if (degreesOfSeparation >= 7) {
    snarkyContent = (
      <>
        <b>*picks jaw up from floor*</b> That was intense!
      </>
    );
  }

  return (
    <p>
      <i>{snarkyContent}</i>
    </p>
  );
};

/**
 *  Adds a warning if the source and/or target page(s) were redirects.
 */
const RedirectWarning: React.FC<{isSourceRedirected: boolean; isTargetRedirected: boolean}> = ({
  isSourceRedirected,
  isTargetRedirected,
}) => {
  let redirectContent;
  if (isSourceRedirected && isTargetRedirected) {
    redirectContent = (
      <p>
        <b>Note:</b> Provided start and end pages are redirects.
      </p>
    );
  } else if (isSourceRedirected) {
    redirectContent = (
      <p>
        <b>Note:</b> Provided start page is a redirect.
      </p>
    );
  } else if (isTargetRedirected) {
    redirectContent = (
      <p>
        <b>Note:</b> Provided end page is a redirect.
      </p>
    );
  }

  return redirectContent;
};

export const Results: React.FC<{
  readonly paths: readonly WikipediaPageId[][];
  readonly pagesById: Record<WikipediaPageId, WikipediaPage>;
  readonly sourcePageTitle: string;
  readonly targetPageTitle: string;
  readonly isSourceRedirected: boolean;
  readonly isTargetRedirected: boolean;
  readonly durationInSeconds: string;
}> = ({
  paths,
  pagesById,
  sourcePageTitle,
  targetPageTitle,
  isSourceRedirected,
  isTargetRedirected,
  durationInSeconds,
}) => {
  const sourcePageLink = (
    <StyledTextLink
      text={sourcePageTitle}
      href={getWikipediaPageUrl(sourcePageTitle)}
      target="_blank"
    />
  );

  const targetPageLink = (
    <StyledTextLink
      text={targetPageTitle}
      href={getWikipediaPageUrl(targetPageTitle)}
      target="_blank"
    />
  );

  // No paths found.
  if (paths.length === 0) {
    return (
      <ResultsMessage>
        <p>
          <b>No path</b> exists from {sourcePageLink} to {targetPageLink}
        </p>
        <RedirectWarning
          isSourceRedirected={isSourceRedirected}
          isTargetRedirected={isTargetRedirected}
        />
      </ResultsMessage>
    );
  }

  const degreesOfSeparation = paths[0].length - 1;
  const pathOrPaths = paths.length === 1 ? 'path' : 'paths';
  const degreeOrDegrees = degreesOfSeparation === 1 ? 'degree' : 'degrees';

  const tweetText = `Found ${getNumberWithCommas(
    paths.length
  )} ${pathOrPaths} with ${degreesOfSeparation} ${degreeOrDegrees} of separation from "${sourcePageTitle}" to "${targetPageTitle}" on Six Degrees of Wikipedia!`;
  const tweetUrl = `https://www.sixdegreesofwikipedia.com/?source=${encodeURIComponent(
    sourcePageTitle
  )}&target=${encodeURIComponent(targetPageTitle)}`;

  return (
    <>
      <ResultsMessage>
        <SnarkyContent degreesOfSeparation={degreesOfSeparation} />
        <p>
          Found{' '}
          <b>
            {getNumberWithCommas(paths.length)} {pathOrPaths}
          </b>{' '}
          with{' '}
          <b>
            {degreesOfSeparation} {degreeOrDegrees}
          </b>{' '}
          of separation from {sourcePageLink} to {targetPageLink} in{' '}
          <b>{durationInSeconds} seconds!</b>
        </p>
        <RedirectWarning
          isSourceRedirected={isSourceRedirected}
          isTargetRedirected={isTargetRedirected}
        />
      </ResultsMessage>
      <TwitterButtonWrapper
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
          tweetText
        )}&url=${encodeURIComponent(tweetUrl)}&via=_jwngr`}
        target="_blank"
      >
        <TwitterButton>
          <TwitterBirdSvg viewBox="0 0 300 300">
            <path d="m250 87.974c-7.358 3.264-15.267 5.469-23.566 6.461 8.471-5.078 14.978-13.119 18.041-22.701-7.929 4.703-16.71 8.117-26.057 9.957-7.484-7.975-18.148-12.957-29.95-12.957-22.66 0-41.033 18.371-41.033 41.031 0 3.216 0.363 6.348 1.062 9.351-34.102-1.711-64.336-18.047-84.574-42.872-3.532 6.06-5.556 13.108-5.556 20.628 0 14.236 7.244 26.795 18.254 34.153-6.726-0.213-13.053-2.059-18.585-5.132-4e-3 0.171-4e-3 0.343-4e-3 0.516 0 19.88 14.144 36.464 32.915 40.234-3.443 0.938-7.068 1.439-10.81 1.439-2.644 0-5.214-0.258-7.72-0.736 5.222 16.301 20.375 28.165 38.331 28.495-14.043 11.006-31.735 17.565-50.96 17.565-3.312 0-6.578-0.194-9.788-0.574 18.159 11.643 39.727 18.437 62.899 18.437 75.473 0 116.75-62.524 116.75-116.75 0-1.779-0.04-3.548-0.119-5.309 8.017-5.784 14.973-13.011 20.474-21.239z" />
          </TwitterBirdSvg>
          <p>Tweet result</p>
        </TwitterButton>
      </TwitterButtonWrapper>
      <ResultsGraph paths={paths} pagesById={pagesById} />
      <ResultsList paths={paths} pagesById={pagesById} />
    </>
  );
};
