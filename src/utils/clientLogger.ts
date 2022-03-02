import { fetchPOST } from '../api/fetch';

export const logError = async (error: Error, stack: string = '') => {
  console.log('error', error);
  console.log('errorStack', stack);
  await fetchPOST('/aap/client-logger/error', { error: error.toString(), stack });
};
