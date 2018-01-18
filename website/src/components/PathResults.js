import React, {Component} from 'react';

import {
  PathArticle,
  PathResult,
  PathResultsMessage,
  PathResultsWrapper,
} from './PathResults.styles';

class PathResults extends Component {
  render() {
    const {paths} = this.props;

    let pathsContent;
    if (paths !== null && paths.length === 0) {
      pathsContent = <p>No paths found!</p>;
    } else if (paths !== null) {
      // TODO: special case when to and from page are the same (something snarky like "You can't
      // trick me that easily..." or "Wow, those articles have zero degrees of separation. But you
      // didn't really need this website to prove that...");
      const pathsCount = paths.length;
      const degreesOfSeparationCount = paths[0].length - 1;
      const pathResults = paths.map((path) => {
        const pathArticles = path.map((articleTitle, index) => {
          let suffix;
          if (index !== path.length - 1) {
            suffix = <span style={{margin: '20px'}}>==></span>;
          }
          return (
            <PathArticle>
              {articleTitle}
              {suffix}
            </PathArticle>
          );
        });
        return <PathResult>{pathArticles}</PathResult>;
      });
      pathsContent = (
        <div>
          <PathResultsMessage>
            {pathsCount} paths found with {degreesOfSeparationCount} of separation!
          </PathResultsMessage>
          {pathResults}
        </div>
      );
    }

    return <PathResultsWrapper>{pathsContent}</PathResultsWrapper>;
  }
}

export default PathResults;
