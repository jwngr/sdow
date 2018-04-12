import React, {Component} from 'react';

import ResultsList from './ResultsList';
import ResultsGraph from './ResultsGraph';
import StyledLink from './common/StyledLink';

import {
  ResultsMessage,
  TwitterButtonWrapper,
  TwitterButton,
  TwitterBirdSvg,
} from './Results.styles';

import {getNumberWithCommas, getWikipediaPageUrl} from '../utils';

class Results extends Component {
  /**
   * Adds some character to the results by rendering a snarky comment for certain degress of
   * separation.
   */
  renderSnarkyContent(degreesOfSeparation) {
    let snarkyContent;
    if (degreesOfSeparation === 0) {
      snarkyContent = (
        <React.Fragment>
          <b>Seriously?</b> Talk about overqualified for the job...
        </React.Fragment>
      );
    } else if (degreesOfSeparation === 1) {
      snarkyContent = (
        <React.Fragment>
          <b>Welp...</b> thanks for making my job easy.
        </React.Fragment>
      );
    } else if (degreesOfSeparation === 5) {
      snarkyContent = (
        <React.Fragment>
          <b>*wipes brow*</b> I really had to work for this one.
        </React.Fragment>
      );
    } else if (degreesOfSeparation === 6) {
      snarkyContent = (
        <React.Fragment>
          <b>*breathes heavily*</b> What a workout!
        </React.Fragment>
      );
    } else if (degreesOfSeparation >= 7) {
      snarkyContent = (
        <React.Fragment>
          <b>*picks jaw up from floor*</b> That was intense!
        </React.Fragment>
      );
    }

    if (snarkyContent) {
      snarkyContent = (
        <p>
          <i>{snarkyContent}</i>
        </p>
      );
    }

    return snarkyContent;
  }

  /**
   *  Adds a warning if the source and/or target page(s) were redirects.
   */
  renderRedirectWarning(isSourceRedirected, isTargetRedirected) {
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
  }

  render() {
    const {results, isFetchingResults} = this.props;
    const {
      paths,
      sourcePageTitle,
      targetPageTitle,
      isSourceRedirected,
      isTargetRedirected,
      durationInSeconds,
    } = results;

    if (paths === null || isFetchingResults) {
      return null;
    }

    const sourcePageLink = (
      <StyledLink href={getWikipediaPageUrl(sourcePageTitle)} target="_blank">
        {sourcePageTitle}
      </StyledLink>
    );
    const targetPageLink = (
      <StyledLink href={getWikipediaPageUrl(targetPageTitle)} target="_blank">
        {targetPageTitle}
      </StyledLink>
    );

    // No paths found.
    if (paths.length === 0) {
      return (
        <ResultsMessage>
          <p>
            <i>
              <b>Welp</b>, this is awkward...
            </i>
          </p>
          <p>
            <b>No path</b> of Wikipedia links exists from {sourcePageLink} to {targetPageLink}.
          </p>
          {this.renderRedirectWarning(
            sourcePageTitle,
            targetPageTitle,
            isSourceRedirected,
            isTargetRedirected
          )}
        </ResultsMessage>
      );
    }

    const degreesOfSeparation = paths[0].length - 1;
    const pathOrPaths = paths.length === 1 ? 'path' : 'paths';
    const degreeOrDegrees = degreesOfSeparation === 1 ? 'degree' : 'degrees';

    const tweetText = `Found ${getNumberWithCommas(
      paths.length
    )} ${pathOrPaths} with ${degreesOfSeparation} ${degreeOrDegrees} of separation from "${sourcePageTitle}" to "${targetPageTitle}" on Six Degrees of Wikipedia!`;
    const tweetUrl = 'https://www.sixdegreesofwikipedia.com';

    return (
      <React.Fragment>
        <ResultsMessage>
          {this.renderSnarkyContent(degreesOfSeparation)}
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
          {this.renderRedirectWarning(isSourceRedirected, isTargetRedirected)}
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
        <ResultsGraph paths={paths} />
        <ResultsList paths={paths} />
      </React.Fragment>
    );
  }
}

export default Results;
