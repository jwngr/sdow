const SDOW_API_URL_DEV = 'http://127.0.0.1:5000';
const SDOW_API_URL_PROD = 'https://api.sixdegreesofwikipedia.com';

export const SDOW_API_URL =
  process.env.NODE_ENV === 'production' ? SDOW_API_URL_PROD : SDOW_API_URL_DEV;

export const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';

export const SDOW_USER_AGENT =
  'Six Degrees of Wikipedia/1.0 (https://www.sixdegreesofwikipedia.com/; wenger.jacob@gmail.com)';
