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
    const contentType = res.headers.get('content-type') || [''];
    const data = contentType.includes('application/json') ? await res.json() : {};
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    console.error(e);
    return { ok: false, error: e };
  }
};
