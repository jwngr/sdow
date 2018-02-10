import _ from 'lodash';

import articleTitles from './resources/articleTitles.json';
import wikipediaFacts from './resources/wikipediaFacts.json';

export const getArticleUrl = (articleTitle) => {
  const baseUrl = 'https://en.wikipedia.org/wiki/';
  const normalizedArticleTitle = articleTitle.replace(' ', '_');
  return `${baseUrl}${normalizedArticleTitle}`;
};

export const getRandomArticleTitle = (previousArticleTitle) => {
  let articleTitle;
  while (typeof articleTitle === 'undefined' || articleTitle === previousArticleTitle) {
    articleTitle = articleTitles[Math.floor(Math.random() * articleTitles.length)];
  }
  return articleTitle;
};

export const getRandomWikipediaFact = (previousFacts) => {
  let fact;
  while (typeof fact === 'undefined' || _.includes(previousFacts, fact)) {
    fact = wikipediaFacts[Math.floor(Math.random() * wikipediaFacts.length)];

    if (previousFacts.length >= wikipediaFacts.length) {
      break;
    }
  }
  return fact;
};
