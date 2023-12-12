import fetch from 'cross-fetch';

export const fetchPOST = async (url: string, payload: object) => {
  const headers = {
    'Content-Type': 'application/json',
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
    return { ok: false, error: e };
  }
};
