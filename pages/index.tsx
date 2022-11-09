import { Veiledning } from 'components/pageComponents/standard/Veiledning/Veiledning';
import { useEffect, useRef, useState } from 'react';
import { Navn, SøkerView } from 'context/sokerOppslagContext';
import React from 'react';
import { useRouter } from 'next/router';
import { GetServerSidePropsResult, NextPageContext } from 'next/types';
import { beskyttetSide } from 'auth/beskyttetSide';
import { getAccessToken } from 'auth/accessToken';
import { fetchPOST } from 'api/fetch';
import { lesBucket } from 'pages/api/buckets/les';
import { StepType } from 'components/StepWizard/Step';
import { SØKNAD_CONTEXT_VERSION } from 'context/soknadContextCommon';
import { isLabs } from 'utils/environments';
import { logSkjemaStartetEvent } from 'utils/amplitude';
import metrics from 'utils/metrics';
import { scrollRefIntoView } from 'utils/dom';
import { getSøkerUtenBarn } from 'pages/api/oppslag/soekerUtenBarn';
import { Alert, Link } from '@navikt/ds-react';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import { TimeoutBox } from 'components/TimeoutBox/TimeoutBox';
interface PageProps {
  søker: {
    navn: Navn;
  };
}

export enum StepNames {
  STARTDATO = 'STARTDATO',
  FASTLEGE = 'FASTLEGE',
  MEDLEMSKAP = 'MEDLEMSKAP',
  YRKESSKADE = 'YRKESSKADE',
  TILLEGGSOPPLYSNINGER = 'TILLEGGSOPPLYSNINGER',
  STUDENT = 'STUDENT',
  ANDRE_UTBETALINGER = 'ANDRE_UTBETALINGER',
  BARNETILLEGG = 'BARNETILLEGG',
  VEDLEGG = 'VEDLEGG',
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

const Introduksjon = ({ søker }: PageProps) => {
  const router = useRouter();
  const { formatMessage } = useFeatureToggleIntl();

  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const errorMessageRef = useRef(null);

  const [soker, setSoker] = useState({});

  useEffect(() => {
    if (søker?.navn) {
      const _søker: SøkerView = {
        fulltNavn: `${søker.navn.fornavn ?? ''} ${søker.navn.mellomnavn ?? ''} ${
          søker.navn.etternavn ?? ''
        }`,
      };
      setSoker(_søker);
    }
  }, [søker, setSoker]);

  const startSoknad = async () => {
    setIsLoading(true);
    setHasError(false);
    logSkjemaStartetEvent();
    const result = await fetchPOST('/aap/soknad/api/buckets/lagre/?type=STANDARD', {
      type: 'STANDARD',
      version: SØKNAD_CONTEXT_VERSION,
      søknad: {},
      lagretStepList: defaultStepList,
    });
    if (!result.ok) {
      setIsLoading(false);
      setHasError(true);
    } else {
      router.push('/1');
    }
  };

  useEffect(() => {
    if (hasError) {
      if (errorMessageRef?.current != null) scrollRefIntoView(errorMessageRef);
    }
  }, [hasError]);

  return (
    <>
      <Veiledning
        søker={soker}
        isLoading={isLoading}
        hasError={hasError}
        errorMessageRef={errorMessageRef}
        onSubmit={async () => {
          await startSoknad();
        }}
      />
      <TimeoutBox />
    </>
  );
};

export const getServerSideProps = beskyttetSide(
  async (ctx: NextPageContext): Promise<GetServerSidePropsResult<{}>> => {
    const stopTimer = metrics.getServersidePropsDurationHistogram.startTimer({ path: '/standard' });
    const bearerToken = getAccessToken(ctx);
    const søker = await getSøkerUtenBarn(bearerToken);
    const mellomlagretSøknad = await lesBucket('STANDARD', bearerToken);
    const activeStep = mellomlagretSøknad?.lagretStepList?.find((e: StepType) => e.active);
    const activeIndex = activeStep?.stepIndex;

    stopTimer();
    if (activeIndex && !isLabs()) {
      return {
        redirect: {
          destination: `/${activeIndex}`,
          permanent: false,
        },
      };
    }
    return {
      props: { søker },
    };
  }
);

export default Introduksjon;
