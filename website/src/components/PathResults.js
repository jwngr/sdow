import React, {Component} from 'react';

import PathArticle from './PathArticle';
import PathResult from './PathResult';
import ArticleLink from './ArticleLink';

import {getArticleUrl} from '../utils';

import {ResultsMessage, PathResultsWrapper} from './PathResults.styles';

class PathResults extends Component {
  render() {
    const {paths, toArticleTitle, fromArticleTitle} = this.props;

    if (paths === null) {
      return null;
    }

    const toArticleUrl = getArticleUrl(toArticleTitle);
    const fromArticleUrl = getArticleUrl(fromArticleTitle);

    if (paths.length === 0) {
      return (
        <ResultsMessage>
          <p>Welp, this is awkward...</p>
          <p>No path of Wikipedia links exists from</p>
          <p>
            <ArticleLink title={fromArticleTitle} url={fromArticleUrl} /> to{' '}
            <ArticleLink title={toArticleTitle} url={toArticleUrl} />.
          </p>
        </ResultsMessage>
      );
    }

    // TODO: special case when to and from page are the same (something snarky like "You can't
    // trick me that easily..." or "Wow, those articles have zero degrees of separation. But you
    // didn't really need this website to prove that...");
    const pathsCount = paths.length;
    const degreesOfSeparation = paths[0].length - 1;
    const pathResults = paths.map((path, i) => {
      // const pathArticles = path.map((pageId, j) => {
      //   const isEndArticle = j === path.length - 1;
      //   return <PathArticle key={j} isEndArticle={isEndArticle} {...pages[pageId]} />;
      // });
      // return <PathResult key={i}>{pathArticles}</PathResult>;
      return <PathResult key={i} pages={path} />;
    });

    // Add some character to results by writing a snarky comment for certain degress of separation.
    let snarkyContent;
    if (degreesOfSeparation === 0) {
      snarkyContent = (
        <p>
          <b>Seriously?</b> Talk about overqualified for the job...{' '}
        </p>
      );
    } else if (degreesOfSeparation === 1) {
      snarkyContent = (
        <p>
          <b>&lt;sarcasm&gt;</b> Hmm... this was a really tough one. <b>&lt;/sarcasm&gt;</b>
        </p>
      );
    } else if (degreesOfSeparation === 5) {
      snarkyContent = (
        <p>
          <b>*wipes brow*</b> I really had to work hard for this one.
        </p>
      );
    } else if (degreesOfSeparation === 6) {
      snarkyContent = (
        <p>
          <b>*breathes heavily*</b> That was quite the workout.
        </p>
      );
    } else if (degreesOfSeparation >= 7) {
      snarkyContent = (
        <p>
          <b>*picks jaw up from floor*</b> Holy moley, THAT was intense!
        </p>
      );
    }

    const pathOrPaths = pathsCount === 1 ? 'path' : 'paths';
    const degreeOrDegrees = degreesOfSeparation === 1 ? 'degree' : 'degrees';

    return (
      <div>
        <ResultsMessage>
          {snarkyContent}
          <p>
            <b>
              {pathsCount} {pathOrPaths}
            </b>{' '}
            found with{' '}
            <b>
              {degreesOfSeparation} {degreeOrDegrees}
            </b>{' '}
            of separation from
          </p>
          <p>
            <ArticleLink title={fromArticleTitle} url={fromArticleUrl} /> to{' '}
            <ArticleLink title={toArticleTitle} url={toArticleUrl} />!
          </p>
        </ResultsMessage>
        <PathResultsWrapper>{pathResults}</PathResultsWrapper>
      </div>
    );
  }
}

export default PathResults;
