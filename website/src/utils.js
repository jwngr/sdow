import _ from 'lodash';

import pageTitles from './resources/pageTitles.json';
import wikipediaFacts from './resources/wikipediaFacts.json';

export const getWikipediaPageUrl = (pageTitle) => {
  const baseUrl = 'https://en.wikipedia.org/wiki/';
  const sanitizedPageTitle = pageTitle.replace(' ', '_');
  return `${baseUrl}${encodeURIComponent(sanitizedPageTitle)}`;
};

let unusedPageTitles = [];
export const getRandomPageTitle = () => {
  if (unusedPageTitles.length === 0) {
    unusedPageTitles = _.clone(pageTitles);
  }

  const indexToRemove = Math.floor(Math.random() * unusedPageTitles.length);
  return unusedPageTitles.splice(indexToRemove, 1)[0];
};

let unusedWikipediaFacts = [];
export const getRandomWikipediaFact = () => {
  if (unusedWikipediaFacts.length === 0) {
    unusedWikipediaFacts = _.clone(wikipediaFacts);
  }

  const indexToRemove = Math.floor(Math.random() * unusedWikipediaFacts.length);
  return unusedWikipediaFacts.splice(indexToRemove, 1)[0];
};

export const getNumberWithCommas = (val) => {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
