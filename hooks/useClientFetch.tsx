const useClientFetch = () => {
  const clientFetch = async (url: string, method?: string, body?: any) => {
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
    }
    return res;
  };
  return { clientFetch };
};
export default useClientFetch;
