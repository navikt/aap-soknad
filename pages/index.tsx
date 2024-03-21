import { Veiledning } from 'components/pageComponents/standard/Veiledning/Veiledning';
import React, { useEffect, useRef, useState } from 'react';
import { SøkerView } from 'context/sokerOppslagContext';
import { useRouter } from 'next/router';
import { GetServerSidePropsResult, NextPageContext } from 'next/types';
import { beskyttetSide } from 'auth/beskyttetSide';
import { fetchPOST } from 'api/fetch';
import { StepType } from 'components/StepWizard/Step';
import { logSkjemaStartetEvent } from 'utils/amplitude';
import metrics from 'utils/metrics';
import { scrollRefIntoView } from 'utils/dom';
import { SOKNAD_VERSION, SoknadContextState } from 'context/soknadcontext/soknadContext';
import { hentMellomlagring } from 'pages/api/mellomlagring/les';
import { isFunctionalTest } from 'utils/environments';
import { logError, logInfo } from '@navikt/aap-felles-utils';
import { Person, getPerson } from 'pages/api/oppslagapi/person';

interface PageProps {
  person?: Person;
  oppslagFeilet: boolean;
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
  { stepIndex: 8, name: StepNames.VEDLEGG },
  { stepIndex: 9, name: StepNames.OPPSUMMERING },
];

const Introduksjon = ({ person, oppslagFeilet }: PageProps) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const errorMessageRef = useRef(null);

  const [soker, setSoker] = useState({});

  useEffect(() => {
    if (person?.navn) {
      const _søker: SøkerView = {
        fulltNavn: person.navn,
      };
      setSoker(_søker);
    }
  }, [person, setSoker]);

  const startSoknad = async () => {
    setIsLoading(true);
    setHasError(false);
    logSkjemaStartetEvent();
    const result = await fetchPOST('/aap/soknad/api/mellomlagring/lagre', {
      version: SOKNAD_VERSION,
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

  if (oppslagFeilet) {
    return <div>Det er rusk i navet :(</div>;
  }
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
    </>
  );
};

export const getServerSideProps = beskyttetSide(
  async (ctx: NextPageContext): Promise<GetServerSidePropsResult<{}>> => {
    const stopTimer = metrics.getServersidePropsDurationHistogram.startTimer({ path: '/standard' });

    let person: Person;

    try {
      person = await getPerson(ctx.req);
    } catch (e) {
      logError('Noe gikk galt i kallet mot oppslag/person', e);
      return {
        props: {
          oppslagFeilet: true,
        },
      };
    }

    let mellomlagretSøknad: SoknadContextState | undefined;

    try {
      mellomlagretSøknad = await hentMellomlagring(ctx.req);
    } catch (e) {
      logError('Noe gikk galt i innhenting av mellomlagret søknad', e);
    }

    const activeStep = mellomlagretSøknad?.lagretStepList?.find((e: StepType) => e.active);
    const activeIndex = activeStep?.stepIndex;

    stopTimer();
    if (activeIndex && !isFunctionalTest()) {
      logInfo('Starter påbegynt søknad');
      return {
        redirect: {
          destination: `/${activeIndex}`,
          permanent: false,
        },
      };
    }
    return {
      props: { person, oppslagFeilet: false },
    };
  },
);

export default Introduksjon;
