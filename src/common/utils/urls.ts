import axios from 'axios';
/**
 * This function joins a list of paths and removes duplicate slashes
 * 
 * @example joinUrls('http://localhost:3000', '/api', '/users') => 'http://localhost:3000/api/users'
 * @param urls list of paths to join
 * @returns 
 */
export const joinUrls = (...urls: string[]) => {
  const joinedUrl = urls.join('/');
  return joinedUrl.replace(/([^:]\/)\/+/g, '$1');
}


export const isUrlActive = async (url: string) => {
  // Timeout at 5 seconds
  const timeout = 5000;
  return axios.get(url, { timeout })
    .then(() => true)
    .catch(() => false);
}