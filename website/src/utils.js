import articleTitles from './resources/articleTitles.json';

export const getRandomArticleTitle = (previousArticleTitle) => {
  let articleTitle;
  while (typeof articleTitle === 'undefined' || articleTitle === previousArticleTitle) {
    articleTitle = articleTitles[Math.floor(Math.random() * articleTitles.length)];
  }
  return articleTitle;
};
