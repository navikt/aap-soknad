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
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const post = async (url: string, payload: object) => {
    setIsLoading(true);
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      data && setData(data);
      setIsLoading(false);
    } catch (e) {
      setError(`useFetchPOST: ${e}`);
      setIsLoading(false);
    }
  };
  return {data, isLoading, post, error}
};
export const fetchPOST = async (url: string, payload: object) => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload)
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
