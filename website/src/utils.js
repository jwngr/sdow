import _ from 'lodash';

import pageTitles from './resources/pageTitles.json';
import wikipediaFacts from './resources/wikipediaFacts.json';

export const getWikipediaPageUrl = (pageTitle) => {
  const baseUrl = 'https://en.wikipedia.org/wiki/';
  const sanitizedPageTitle = pageTitle.replace(' ', '_');
  return `${baseUrl}${encodeURIComponent(sanitizedPageTitle)}`;
};

export const getRandomPageTitle = (previousPageTitle) => {
  let pageTitle;
  while (typeof pageTitle === 'undefined' || pageTitle === previousPageTitle) {
    pageTitle = pageTitles[Math.floor(Math.random() * pageTitles.length)];
  }
  return pageTitle;
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
