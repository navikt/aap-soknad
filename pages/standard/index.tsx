import useSwr from 'swr';

import { Veiledning } from '../../src/pages/standard/Veiledning/Veiledning';

import { useEffect, useState } from 'react';
import { SokerOppslagState, SøkerView } from '../../src/context/sokerOppslagContext';
import React from 'react';
import { useRouter } from 'next/router';

const sokerUrl = '/aap/soknad/api/oppslag/soeker/';

const fetcher = async (url: string) =>
  await fetch(url)
    .then((res) => res.json())
    .catch((err) => {
      throw err;
    });

const Introduksjon = () => {
  const { data, error } = useSwr<SokerOppslagState>(sokerUrl, fetcher);
  const router = useRouter();

  const [soker, setSoker] = useState({});

  useEffect(() => {
    if (data?.søker) {
      const _søker: SøkerView = {
        fulltNavn: `${data.søker.navn.fornavn ?? ''} ${data.søker.navn.mellomnavn ?? ''} ${
          data.søker.navn.etternavn ?? ''
        }`,
      };
      setSoker(_søker);
    }
  }, [data, setSoker]);

  return <Veiledning søker={soker} loading={false} onSubmit={() => router.push('startdato')} />;
};

export default Introduksjon;
