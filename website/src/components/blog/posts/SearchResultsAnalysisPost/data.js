import React from 'react';
import StyledLink from '../../../common/StyledLink';

import {getNumberWithCommas, getWikipediaPageUrl} from '../../../../utils';

export const totalSearches = 503498;
export const uniqueSearches = 377135;
export const percentUniqueSearches = (uniqueSearches / totalSearches * 100).toFixed(2);
export const searchesWithNoPaths = 4018;
export const percentNoPathsSearches = (searchesWithNoPaths / uniqueSearches * 100).toFixed(2);
export const averageDegreesOfSeparation = 3.019;
export const degreesOfSeparationHistogramData = [
  524,
  10216,
  90068,
  183172,
  67754,
  16317,
  3738,
  1228,
  141,
  27,
  1,
  1,
];
export const averageDuration = 0.76;
export const medianDuration = 0.38;
export const percentile95Duration = 2.66;
export const percentile99Duration = 4.99;

export const mostPopularSearchesHeaders = [
  'Search',
  'Degrees of Separation',
  'Number of Searches',
  {text: 'Source', width: 140},
];

const mostPopularSearches = [
  [
    'Anime',
    'Obesity',
    3,
    2813,
    <StyledLink href="https://news.ycombinator.com/item?id=16468749">Hacker News</StyledLink>,
  ],
  [
    'Age of Enlightenment',
    'Consumption of Tide Pods',
    2,
    2611,
    <StyledLink href="https://news.ycombinator.com/item?id=16468523">Hacker News</StyledLink>,
  ],
  [
    'Anime',
    'Alt-right',
    2,
    1557,
    <StyledLink href="https://news.ycombinator.com/item?id=16469486">Hacker News</StyledLink>,
  ],
  [
    'Lion Express',
    'Phinney',
    7,
    1380,
    <StyledLink href="https://news.ycombinator.com/item?id=16469620">Hacker News</StyledLink>,
  ],
  [
    'Spud gun',
    'Sputnik-1 EMC/EMI lab model',
    'No path',
    1274,
    <StyledLink href="https://news.ycombinator.com/item?id=16468643">Hacker News</StyledLink>,
  ],
  [
    'Consumption of Tide Pods',
    'Age of Enlightenment',
    3,
    1160,
    <StyledLink href="https://news.ycombinator.com/item?id=16468945">Hacker News</StyledLink>,
  ],
  [
    'Hargrave Military Academy',
    'Illiosentidae',
    6,
    763,
    <StyledLink href="https://github.com/jwngr/sdow/blob/master/docs/miscellaneous.md#noteworthy-searches">
      GitHub
    </StyledLink>,
  ],
  [
    'Six Degrees of Kevin Bacon',
    'Phinney',
    6,
    692,
    <StyledLink href="https://github.com/jwngr/sdow/blob/master/docs/miscellaneous.md#noteworthy-searches">
      GitHub
    </StyledLink>,
  ],
  [
    'John F. Kennedy',
    'Mikko Hyppönen',
    3,
    642,
    <StyledLink href="https://twitter.com/mikko/status/968407596347641856">Twitter</StyledLink>,
  ],
  [
    'CT scan',
    'MetaFilter',
    3,
    548,
    <StyledLink href="https://www.metafilter.com/172674/CT-Scan-Laser-Public-Domain-Metafilter">
      MetaFilter
    </StyledLink>,
  ],
];

export const mostPopularSearchesRows = mostPopularSearches.map((searchInfo) => {
  const searchUrl = `/?source=${encodeURIComponent(searchInfo[0])}&target=${encodeURIComponent(
    searchInfo[1]
  )}`;
  const link = <StyledLink href={searchUrl}>{`${searchInfo[0]} → ${searchInfo[1]}`}</StyledLink>;
  return [link, searchInfo[2], getNumberWithCommas(searchInfo[3]), searchInfo[4]];
});

export const mostPopularPagesHeaders = ['Page Title', 'Number of Searches'];

const mostPopularPages = [
  ['Adolf Hitler', 12166],
  ['Donald Trump', 4984],
  ['Barack Obama', 2398],
  ['Jesus', 2397],
  ['Kevin Bacon', 1967],
  ['Philosophy', 1925],
  ['Elon Musk', 1790],
  ['Bitcoin', 1448],
  ['Albert Einstein', 1349],
  ['Death Grips', 1242],
];

export const mostPopularPagesRows = mostPopularPages.map((pageInfo) => {
  const link = <StyledLink href={getWikipediaPageUrl(pageInfo[0])}>{pageInfo[0]}</StyledLink>;
  return [link, getNumberWithCommas(pageInfo[1])];
});

export const mostPathSearchesHeaders = ['Search', 'Degrees of Separation', 'Result Paths'];

const mostPathSearches = [
  ['List of shipwrecks in 1842', 'Geographic coordinate system', 2, 1229],
  ['List of 20th-century writers', 'List of sovereign states', 3, 7145],
  ['Alpaca', 'Czech phonology', 4, 9705],
  ['Berchtesgaden', 'Wrestle Kingdom 10', 5, 10277],
  ['Data monitoring switch', 'Pirpainti (Vidhan Sabha constituency)', 6, 13131],
  ['112th Ohio General Assembly', 'Gunnar Knudsenfjella', 7, 7288],
  ['Generalized Tobit', 'Phinney', 8, 6248],
  ['Lion Express', 'Phinney', 9, 1246],
  ['Lion Express', 'Excitation', 10, 262],
  ['Embleton', 'McCombie', 11, 142],
];

export const mostPathSearchesRow = mostPathSearches.map((searchInfo) => {
  // const searchUrl = `/?source=${encodeURIComponent(searchInfo[0])}&target=${encodeURIComponent(
  //   searchInfo[1]
  // )}`;
  // const link = <StyledLink href={searchUrl}>{`${searchInfo[0]} → ${searchInfo[1]}`}</StyledLink>;
  return [
    <b>
      {searchInfo[0]} → {searchInfo[1]}
    </b>,
    searchInfo[2],
    getNumberWithCommas(searchInfo[3]),
  ];
});
