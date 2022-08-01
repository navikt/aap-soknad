import { Veiledning } from '../../src/pages/standard/Veiledning/Veiledning';

import { useEffect, useState } from 'react';
import { SokerOppslagState, SøkerView } from '../../src/context/sokerOppslagContext';
import React from 'react';
import { useRouter } from 'next/router';
import { GetServerSidePropsResult, NextPageContext } from 'next/types';
import { beskyttetSide } from '../../auth/beskyttetSide';
import { getAccessToken } from '../../auth/accessToken';
import { getSøker } from '../api/oppslag/soeker';
import { fetchPOST } from '../../src/api/fetch';
import { defaultStepList } from '../../src/pages/standard';
interface PageProps {
  søker: SokerOppslagState;
}

const Introduksjon = ({ søker }: PageProps) => {
  const router = useRouter();

  const [soker, setSoker] = useState({});

  useEffect(() => {
    if (søker?.søker) {
      const _søker: SøkerView = {
        fulltNavn: `${søker.søker.navn.fornavn ?? ''} ${søker.søker.navn.mellomnavn ?? ''} ${
          søker.søker.navn.etternavn ?? ''
        }`,
      };
      setSoker(_søker);
    }
  }, [søker, setSoker]);

  const startSoknad = async () => {
    await fetchPOST(
      `${process.env.NEXT_PUBLIC_TEMP_LAGRE_URL ?? '/aap/soknad-api/buckets/lagre/'}STANDARD`,
      {
        type: 'STANDARD',
        version: 1,
        søknad: {},
        lagretStepList: defaultStepList,
      }
    );
  };

  return (
    <Veiledning
      søker={soker}
      loading={false}
      onSubmit={async () => {
        await startSoknad();
        router.push('standard/1');
      }}
    />
  );
};

export const getServerSideProps = beskyttetSide(
  async (ctx: NextPageContext): Promise<GetServerSidePropsResult<{}>> => {
    const bearerToken = getAccessToken(ctx);
    const søker = await getSøker(bearerToken);

    return {
      props: { søker },
    };
  }
);

export default Introduksjon;
