import { useState, useEffect } from 'react';

export const useFetchGET = (url: string) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const abortController = new AbortController();
    const fetchGet = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(url, {method: 'GET'});
        const data = await res.json();
        data && setData(data);
        setIsLoading(false);
      } catch (e) {
        setError(`useFetchGET: ${e}`);
        setIsLoading(false);
      }
    }
    fetchGet();
    return () => {
      abortController.abort();
    }
  }, [url])
  return {data, isLoading, error}
};

export const useFetchPOST = () => {
  const [data, setData] = useState({ok: false, data: undefined});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const postFetch = async (url: string, payload: object) => {
    setIsLoading(true);
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      data && setData({ok: res.ok, data});
      setIsLoading(false);
    } catch (e) {
      setError(`useFetchPOST: ${e}`);
      setIsLoading(false);
    }
  };
  return {postResponse: data, isLoading, postFetch, error}
};

type Options = {
  headers?: object;
}
export const fetchPOST = async (url: string, payload: object, opts: Options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers ? opts.headers : {})
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers
    });
    if(res.ok) {
      const data = await res.json();
      return { ok: res.ok, data};
    } else {
      return {ok: res.ok, error: res.statusText};
    }
  } catch (e) {
    return { error: `useFetchPOST: ${e}` };
  }
};
