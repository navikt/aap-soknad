import { Veiledning } from 'components/pageComponents/standard/Veiledning/Veiledning';

import { useEffect, useState } from 'react';
import { SokerOppslagState, SøkerView } from 'context/sokerOppslagContext';
import React from 'react';
import { useRouter } from 'next/router';
import { GetServerSidePropsResult, NextPageContext } from 'next/types';
import { beskyttetSide } from 'auth/beskyttetSide';
import { getAccessToken } from 'auth/accessToken';
import { getSøker } from '../api/oppslag/soeker';
import { fetchPOST } from 'api/fetch';
import { setStepList, useStepWizard } from 'context/stepWizardContextV2';
import { setSoknadStateFraProps } from 'context/soknadContextCommon';
import {
  SoknadContextProviderStandard,
  useSoknadContextStandard,
} from 'context/soknadContextStandard';
import { GenericSoknadContextState } from 'types/SoknadContext';
import { Soknad } from 'types/Soknad';
import { lesBucket } from 'pages/api/buckets/les';
import { StepType } from 'components/StepWizard/Step';
interface PageProps {
  søker: SokerOppslagState;
  mellomlagretSøknad: GenericSoknadContextState<Soknad>;
}

export enum StepNames {
  STARTDATO = 'STARTDATO',
  FASTLEGE = 'FASTLEGE',
  MEDLEMSKAP = 'MEDLEMSKAP',
  YRKESSKADE = 'YRKESSKADE',
  STUDENT = 'STUDENT',
  ANDRE_UTBETALINGER = 'ANDRE_UTBETALINGER',
  BARNETILLEGG = 'BARNETILLEGG',
  VEDLEGG = 'VEDLEGG',
  TILLEGGSOPPLYSNINGER = 'TILLEGGSOPPLYSNINGER',
  OPPSUMMERING = 'OPPSUMMERING',
}
export const defaultStepList = [
  { stepIndex: 1, name: StepNames.STARTDATO, active: true },
  { stepIndex: 2, name: StepNames.MEDLEMSKAP },
  { stepIndex: 3, name: StepNames.YRKESSKADE },
  { stepIndex: 4, name: StepNames.FASTLEGE },
  { stepIndex: 5, name: StepNames.BARNETILLEGG },
  { stepIndex: 6, name: StepNames.STUDENT },
  { stepIndex: 7, name: StepNames.ANDRE_UTBETALINGER },
  { stepIndex: 8, name: StepNames.TILLEGGSOPPLYSNINGER },
  { stepIndex: 9, name: StepNames.VEDLEGG },
  { stepIndex: 10, name: StepNames.OPPSUMMERING },
];

const Introduksjon = ({ søker, mellomlagretSøknad }: PageProps) => {
  const router = useRouter();

  const [soker, setSoker] = useState({});
  const { stepWizardDispatch } = useStepWizard();
  const { søknadState, søknadDispatch } = useSoknadContextStandard();

  useEffect(() => {
    if (søknadState?.søknad === undefined) {
      setSoknadStateFraProps(mellomlagretSøknad, søknadDispatch);
      if (mellomlagretSøknad.lagretStepList && mellomlagretSøknad?.lagretStepList?.length > 0) {
        setStepList([...mellomlagretSøknad.lagretStepList], stepWizardDispatch);
      }
    }
  }, []);

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

const IntroduksjonWithContextProvider = ({ søker, mellomlagretSøknad }: PageProps) => (
  <SoknadContextProviderStandard>
    <Introduksjon søker={søker} mellomlagretSøknad={mellomlagretSøknad} />
  </SoknadContextProviderStandard>
);

export const getServerSideProps = beskyttetSide(
  async (ctx: NextPageContext): Promise<GetServerSidePropsResult<{}>> => {
    const bearerToken = getAccessToken(ctx);
    const søker = await getSøker(bearerToken);
    const mellomlagretSøknad = await lesBucket('STANDARD', bearerToken);
    const activeIndex = mellomlagretSøknad?.lagretStepList?.find(
      (e: StepType) => e.active
    )?.stepIndex;

    if (activeIndex) {
      return {
        redirect: {
          destination: `/standard/${activeIndex}`,
          permanent: false,
        },
      };
    }
    return {
      props: { søker, mellomlagretSøknad },
    };
  }
);

export default IntroduksjonWithContextProvider;
