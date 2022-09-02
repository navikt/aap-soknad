import useClientFetch from '../hooks/useClientFetch';

const TestSide = () => {
  const { clientFetch } = useClientFetch();
  const fetch404 = async () =>
    clientFetch('/aap/soknad/api/tullball/vedlegg/lagre/', 'POST', {}).then((res) => {
      console.log('status', res.ok, res.status);
      throw new Error('Fant ikke tullball');
    });
  return <button onClick={() => fetch404()}>Test 404</button>;
};
export default TestSide;
