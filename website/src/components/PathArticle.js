import axios from 'axios';
import React, {Component} from 'react';

import {PathArticleWrapper} from './PathArticle.styles';

class PathResults extends Component {
  constructor() {
    super();

    this.state = {
      imageUrl: null,
    };
  }

  componentDidMount() {
    // const {title} = this.props;
    const title = 'Porto';
    const queryParams = [
      'format=json',
      'action=query',
      'piprop=thumbnail',
      'pithumbsize=160',
      'pilimit=2',
      `titles=${title}`,
      'prop=info|pageimages|pageterms',
      'inprop=url',
      'wbptterms=description',
      'origin=*',
    ];

    const queryString = queryParams.join('&');
    const url = `https://en.wikipedia.org/w/api.php?${queryString}`;
    console.log(url);

    // const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${title}&prop=info|pageimages|pageterms&inprop=url&wbptterms=description&pilimit=2&origin=*`;

    // https://en.wikipedia.org/w/api.php?action=query&format=json&generator=prefixsearch&prop=pageprops%7Cpageimages%7Cpageterms&redirects=&ppprop=displaytitle&piprop=thumbnail&pithumbsize=160&pilimit=6&wbptterms=description&gpssearch=por&gpsnamespace=0&gpslimit=6&callback=callbackStack.queue%5B0%5D

    axios({
      method: 'get',
      url: url,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    }).then((response) => {
      console.log(response.data.query);

      // this.setState({
      //   imageUrl: 'foo',
      // });
    });
  }

  render() {
    const {title, isEndArticle} = this.props;

    let arrowContent;
    if (!isEndArticle) {
      arrowContent = <span style={{margin: '20px'}}>==></span>;
    }

    // Get the article's thumbnail
    // See https://stackoverflow.com/a/20311613/2955366
    // Example URL: https://en.wikipedia.org/w/api.php?action=query&titles=Fortification|Albert%20Einstein&prop=pageimages&format=json&pilimit=2
    // console.log(md5(title));

    return (
      <div style={{display: 'flex'}}>
        <PathArticleWrapper>{title}</PathArticleWrapper>
        {arrowContent}
      </div>
    );
  }
}

export default PathResults;
