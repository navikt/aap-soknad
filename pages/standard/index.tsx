import useTexts from '../../src/hooks/useTexts';
import useSwr from 'swr';

import { Veiledning } from '../../src/pages/standard/Veiledning/Veiledning';

import * as tekster from '../../src/pages/standard/tekster';
import { useEffect, useState } from 'react';
import { SokerOppslagState, SøkerView } from '../../src/context/sokerOppslagContext';

const sokerUrl = '/aap/soknad/api/oppslag/soeker/';

const fetcher = async (url: string) =>
  await fetch(url)
    .then((res) => res.json())
    .catch((err) => {
      throw err;
    });

const Introduksjon = () => {
  const { getText } = useTexts(tekster);

  const { data, error } = useSwr<SokerOppslagState>(sokerUrl, fetcher);

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

  return (
    <Veiledning
      getText={getText}
      søker={soker}
      loading={false}
      onSubmit={() => console.log('onSubmit')}
    />
  );
};

export default Introduksjon;