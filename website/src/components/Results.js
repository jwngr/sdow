import React, {Component} from 'react';

import ResultsList from './ResultsList';
import ResultsGraph from './ResultsGraph';
import WikipediaPageLink from './WikipediaPageLink';

import {ResultsMessage} from './Results.styles';

import {getNumberWithCommas} from '../utils';

class Results extends Component {
  render() {
    const {paths, sourcePageTitle, targetPageTitle, durationInSeconds} = this.props;

    if (paths === null) {
      return null;
    }

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
            <b>No path</b> of Wikipedia links exists from{' '}
            <WikipediaPageLink title={sourcePageTitle} /> to{' '}
            <WikipediaPageLink title={targetPageTitle} />.
          </p>
        </ResultsMessage>
      );
    }

    // Add some character to results by writing a snarky comment for certain degress of separation.
    let snarkyContent;
    const degreesOfSeparation = paths[0].length - 1;
    if (degreesOfSeparation === 0) {
      snarkyContent = (
        <i>
          <b>Seriously?</b> Talk about overqualified for the job...
        </i>
      );
    } else if (degreesOfSeparation === 1) {
      snarkyContent = (
        <i>
          <b>Welp...</b> thanks for making my job easy.
        </i>
      );
    } else if (degreesOfSeparation === 5) {
      snarkyContent = (
        <i>
          <b>*wipes brow*</b> I really had to work for this one.
        </i>
      );
    } else if (degreesOfSeparation === 6) {
      snarkyContent = (
        <i>
          <b>*breathes heavily*</b> What a workout!
        </i>
      );
    } else if (degreesOfSeparation >= 7) {
      snarkyContent = (
        <i>
          <b>*picks jaw up from floor*</b> That was intense!
        </i>
      );
    }

    const pathOrPaths = paths.length === 1 ? 'path' : 'paths';
    const degreeOrDegrees = degreesOfSeparation === 1 ? 'degree' : 'degrees';

    return (
      <React.Fragment>
        <ResultsMessage>
          <p>{snarkyContent}</p>
          <p>
            Found{' '}
            <b>
              {getNumberWithCommas(paths.length)} {pathOrPaths}
            </b>{' '}
            with{' '}
            <b>
              {degreesOfSeparation} {degreeOrDegrees}
            </b>{' '}
            of separation from <WikipediaPageLink title={sourcePageTitle} /> to{' '}
            <WikipediaPageLink title={targetPageTitle} /> in <b>{durationInSeconds} seconds</b>!
          </p>
        </ResultsMessage>
        <ResultsGraph paths={paths} />
        <ResultsList paths={paths} />
      </React.Fragment>
    );
  }
}

export default Results;
