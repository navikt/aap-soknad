class FetchError extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.cause = cause;
    this.name = 'FetchError';
  }
}
const useClientFetch = () => {
  const clientFetch = async (url: string, method?: string, body?: any) => {
    try {
      const res = await fetch(url, {
        method: method || 'GET',
        ...(body ? { body: JSON.stringify(body) } : {}),
        redirect: 'manual',
      });
      if (res.status === 0) {
        // eslint-disable-next-line max-len
        const path = `https://aap-soknad.${process.env.NEXT_PUBLIC_NAV_HOSTNAME_URL}/oauth2/login?redirect=/aap/soknad/standard`;
        if (window) {
          // @ts-ignore
          window.location = path;
        }
      } else if (!res.ok) {
        const isJson = res.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await res.json() : null;
        // get error message from body or default to response status
        const error = new FetchError(`status: ${res.status}, msg: ${data?.message}`);
        return Promise.reject(error);
      }
      return res;
    } catch (err) {
      return Promise.reject(err);
    }
  };
  return { clientFetch };
};
export default useClientFetch;
