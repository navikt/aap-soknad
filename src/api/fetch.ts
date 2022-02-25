import { RequestOptions } from 'http';
import { APP_URL_TEST } from '../config';
import fetch from 'cross-fetch';

export const fetchPOST = async (url: string, payload: object, opts: RequestOptions = {}) => {
  const completeUrl = process.env.NODE_ENV === 'test' ? `${APP_URL_TEST}${url}` : url;
  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers ? opts.headers : {}),
  };
  try {
    const res = await fetch(completeUrl, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers,
    });
    if (res.ok) {
      const data = await res.json();
      return { ok: res.ok, data };
    } else {
      return { ok: res.ok, error: res.statusText };
    }
  } catch (e) {
    return { error: `useFetchPOST: ${e}` };
  }
};
