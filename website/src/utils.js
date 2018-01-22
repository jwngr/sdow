import articleTitles from './resources/articleTitles.json';

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
