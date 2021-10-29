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

export const useFetchPOST = (url: string, payload: object) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const abortController = new AbortController();
    const fetchPost = async () => {
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
    }
    fetchPost();
    return () => {
      abortController.abort();
    }
  }, [url, payload])
  return {data, isLoading, error}
};
