import { useRouter } from 'next/router';

const useClientFetch = () => {
  const router = useRouter();
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
        console.log('redirect to ', path);
        await router.push(path);
      }
      return res;
    } catch (err) {
      //global error handling for network errors (4.., 5..)
    }
  };
  return { clientFetch };
};
export default useClientFetch;
