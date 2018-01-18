import React, {Component} from 'react';

import ArticleInputContainer from '../containers/ArticleInputContainer';
import SearchButtonContainer from '../containers/SearchButtonContainer';

import {Header, MainContent, PathArticle, PathResult, ErrorMessage} from './Home.styles';

class Home extends Component {
  render() {
    const {error, paths} = this.props;

    let errorContent;
    let pathsContent;
    if (error !== null) {
      errorContent = <ErrorMessage>{error}</ErrorMessage>;
    } else {
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
            <p>
              {pathsCount} paths found with {degreesOfSeparationCount} of separation!
            </p>
            {pathResults}
          </div>
        );
      }
    }

    return (
      <div>
        <Header>
          <h1>Six Degrees of Wikipedia</h1>
        </Header>
        <MainContent>
          <p>Find the shortest path from</p>
          <ArticleInputContainer toOrFrom="from" placeholder="T. S. Eliot" />
          <p>to</p>
          <ArticleInputContainer toOrFrom="to" placeholder="Fortune-telling" />
          <SearchButtonContainer />

          {pathsContent}
          {errorContent}
        </MainContent>
      </div>
    );
  }
}

export default Home;
