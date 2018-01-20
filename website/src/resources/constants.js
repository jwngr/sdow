const SDOW_API_URL_DEV = 'http://127.0.0.1:5000';
// const SDOW_API_URL_DEV = 'http://35.225.120.226:5000';
const SDOW_API_URL_PROD = 'TODO: add an permanent URL here';

export const SDOW_API_URL =
  process.env.NODE_ENV === 'production' ? SDOW_API_URL_PROD : SDOW_API_URL_DEV;

export const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';
