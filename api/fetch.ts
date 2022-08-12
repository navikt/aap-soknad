import { RequestOptions } from 'http';
import fetch from 'cross-fetch';

export const fetchPOST = async (url: string, payload: object, opts: RequestOptions = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers ? opts.headers : {}),
  };
  try {
    const res = await fetch(url, {
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
