import _ from 'lodash';

import articleTitles from './resources/articleTitles.json';

export const getRandomArticleTitle = (previousArticleTitle) => {
  let articleTitle;
  while (typeof articleTitle === 'undefined' || articleTitle === previousArticleTitle) {
    articleTitle = articleTitles[Math.floor(Math.random() * articleTitles.length)];
  }
  return articleTitle;
};

export const constructUrlWithQueryString = (url, queryParams) => {
  const queryParamsArray = _.map(queryParams, (value, key) => {
    return `${key}=${value}`;
  });
  const queryString = queryParamsArray.join('&');

  return `${url}?${queryString}`;
};
