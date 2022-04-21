import useSWR from 'swr';
import { SoknadContextState, soknadContextInititalState } from '../context/soknadContext';

const fetcher = async (url: string) => {
  return await fetch(url).then((res) => res.json());
};

export const useSøknadsdata = (søknadType: string) => {
  const lesUrl = `/aap/soknad/api/buckets/les/${søknadType}`;
  const skrivUrl = `/aap/soknad/api/buckets/skriv/${søknadType}`;

  const { data, error, mutate } = useSWR<SoknadContextState>(lesUrl, fetcher, {
    fallbackData: soknadContextInititalState,
  });

  const setSøknadsdata = async (nySøknadsdata: Partial<SoknadContextState>) => {
    const updatedSøknadsdata = { ...(data as SoknadContextState), ...nySøknadsdata };
    await mutate(
      async (dataPayload) => {
        await fetch(skrivUrl, { method: 'POST', body: JSON.stringify(dataPayload) });
        return dataPayload;
      },
      { optimisticData: updatedSøknadsdata }
    );
  };

  return {
    søknadsdata: data as SoknadContextState,
    setSøknadsdata,
    isLoading: !error && !data,
    isError: error,
  };
};
