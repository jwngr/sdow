import clone from 'lodash/clone';

import pageTitles from './resources/pageTitles.json';
import wikipediaFacts from './resources/wikipediaFacts.json';

export const getWikipediaPageUrl = (pageTitle: string): string => {
  const baseUrl = 'https://en.wikipedia.org/wiki/';
  const sanitizedPageTitle = pageTitle.replace(/ /g, '_');
  return `${baseUrl}${encodeURIComponent(sanitizedPageTitle)}`;
};

let unusedPageTitles: string[] = [];
export const getRandomPageTitle = (): string => {
  if (unusedPageTitles.length === 0) {
    unusedPageTitles = clone(pageTitles);
  }

  const indexToRemove = Math.floor(Math.random() * unusedPageTitles.length);
  return unusedPageTitles.splice(indexToRemove, 1)[0];
};

let unusedWikipediaFacts: string[] = [];
export const getRandomWikipediaFact = (): string => {
  if (unusedWikipediaFacts.length === 0) {
    unusedWikipediaFacts = clone(wikipediaFacts);
  }

  const indexToRemove = Math.floor(Math.random() * unusedWikipediaFacts.length);
  return unusedWikipediaFacts.splice(indexToRemove, 1)[0];
};

export const getNumberWithCommas = (val: number): string => {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
