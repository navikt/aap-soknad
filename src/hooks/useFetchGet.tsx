import {useEffect, useState} from "react";
import {APP_URL_TEST} from "../config";
import fetch from "cross-fetch";

export const useFetchGET = (url: string) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if(!url) return;
    const abortController = new AbortController();
    const completeUrl = process.env.NODE_ENV === "test"
      ? `${APP_URL_TEST}${url}`
      : url;
    const fetchGet = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(completeUrl, {method: 'GET'});
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
