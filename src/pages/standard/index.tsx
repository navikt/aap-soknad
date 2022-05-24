import React, { useEffect, useState } from 'react';
import { useTexts } from '../../hooks/useTexts';
import { PageHeader } from '@navikt/ds-react';
import * as tekster from './tekster';
import { Step, StepWizard } from '../../components/StepWizard';
import { SubmitHandler } from 'react-hook-form';
import {
  completeAndGoToNextStep,
  useStepWizard,
  resetStepWizard,
  goToPreviousStep,
} from '../../context/stepWizardContextV2';
import Soknad from '../../types/Soknad';
import {
  useSoknadContext,
  slettLagretSoknadState,
  addBarnIfMissing,
} from '../../context/soknadContext';
import { Veiledning } from './Veiledning/Veiledning';
import { hentSokerOppslag, useSokerOppslag } from '../../context/sokerOppslagContext';
import { Behandlere } from './Behandlere/Behandlere';
import { Medlemskap } from './Medlemskap/Medlemskap';
import { Yrkesskade } from './Yrkesskade/Yrkesskade';
import { AndreUtbetalinger } from './AndreUtbetalinger/AndreUtbetalinger';
import { Barnetillegg } from './Barnetillegg/Barnetillegg';
import Oppsummering from './Oppsummering/Oppsummering';
import Tilleggsopplysninger from './Tilleggsopplysninger/Tilleggsopplysninger';
import Vedlegg from './Vedlegg/Vedlegg';
import StartDato from './StartDato/StartDato';
import Student from './Student/Student';
import Kvittering from './Kvittering/Kvittering';
import { fetchPOST } from '../../api/fetch';
import * as classes from './standard.module.css';
import { format } from 'date-fns';
export enum StepNames {
  VEILEDNING = 'VEILEDNING',
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

const formatDate = (date?: Date): string | undefined =>
  date ? format(date, 'yyyy-MM-dd') : undefined;

const getHvorfor = (hvorfor?: string) => {
  if (hvorfor === 'Sykdom') return 'HELSE';
  if (hvorfor === 'Manglende informasjon') return 'FEILINFO';
  return undefined;
};

const getFerieType = (skalHaFerie?: string, ferieType?: string) => {
  if (skalHaFerie === 'Ja' && ferieType === 'Ja') return 'PERIODE';
  if (skalHaFerie === 'Ja' && ferieType === 'Nei, men jeg vet antall dager') return 'DAGER';
  if (skalHaFerie === 'Nei') return 'NEI';
  if (skalHaFerie === 'Vet ikke') return 'VET_IKKE';
  return undefined;
};

const getJaNeiVetIkke = (value?: string) => {
  if (value === 'Ja') return 'JA';
  if (value === 'Nei') return 'NEI';
  if (value === 'Vet ikke') return 'VET_IKKE';
  return undefined;
};

const jaNeiToBoolean = (value?: string) => {
  if (value === 'Ja') return true;
  if (value === 'Nei') return false;
  return undefined;
};

interface SøknadBackendState {
  type: 'STUDENT' | 'STANDARD';
  startDato: {
    fom?: string;
    hvorfor?: string;
    beskrivelse?: string;
  };
  ferie: {
    ferieType?: 'PERIODE' | 'DAGER' | 'NEI' | 'VET_IKKE';
    periode: {
      fom?: string;
      tom?: string;
    };
    dager?: number | string;
  };
  medlemsskap: {
    boddINorgeSammenhengendeSiste5?: boolean;
    jobbetUtenforNorgeFørSyk?: boolean;
    jobbetSammenhengendeINorgeSiste5?: boolean;
    iTilleggArbeidUtenforNorge?: boolean;
    utenlandsopphold: {
      land?: string;
      periode: { fom?: string; tom?: string };
      arbeidet?: boolean;
      id?: string;
      landsNavn?: string;
    }[];
  };
  behandlere: [];
  yrkesskadeType?: 'JA' | 'NEI' | 'VET_IKKE';
  utbetalinger: {
    fraArbeidsgiver?: boolean;
    stønadstyper: [];
    andreUtbetalinger: [];
  };
  registrerteBarn: [];
  andreBarn: [];
  tilleggsopplysninger?: string;
}

const mapSøknadToBackend = (søknad?: Soknad): SøknadBackendState => ({
  type: søknad?.student ? 'STUDENT' : 'STANDARD',
  startDato: {
    fom: formatDate(søknad?.startDato),
    hvorfor: getHvorfor(søknad?.hvorfor),
    beskrivelse: søknad?.begrunnelse,
  },
  ferie: {
    ferieType: getFerieType(søknad?.ferie?.skalHaFerie, søknad?.ferie?.ferieType),
    periode: {
      fom: formatDate(søknad?.ferie?.fraDato),
      tom: formatDate(søknad?.ferie?.tilDato),
    },
    dager: søknad?.ferie?.antallDager,
  },
  medlemsskap: {
    boddINorgeSammenhengendeSiste5: jaNeiToBoolean(søknad?.medlemskap?.harBoddINorgeSiste5År),
    jobbetUtenforNorgeFørSyk: jaNeiToBoolean(søknad?.medlemskap?.arbeidetUtenforNorgeFørSykdom),
    jobbetSammenhengendeINorgeSiste5: jaNeiToBoolean(søknad?.medlemskap?.harArbeidetINorgeSiste5År),
    iTilleggArbeidUtenforNorge: jaNeiToBoolean(søknad?.medlemskap?.iTilleggArbeidUtenforNorge),
    utenlandsopphold:
      søknad?.medlemskap?.utenlandsOpphold?.map((utenlandsopphold) => ({
        land: utenlandsopphold.land,
        periode: {
          fom: formatDate(utenlandsopphold.fraDato),
          tom: formatDate(utenlandsopphold.tilDato),
        },
        arbeidet: utenlandsopphold.iArbeid,
        id: utenlandsopphold.utenlandsId,
        landsNavn: '', // TODO: Hente navn fra landkode
      })) ?? [],
  },
  behandlere: [], // TODO: Mappe behandlere
  yrkesskadeType: getJaNeiVetIkke(søknad?.yrkesskade),
  utbetalinger: {
    fraArbeidsgiver: true, // TODO: Mappe søknadState?.søknad?.andreUtbetalinger?.lønn ? true : false
    stønadstyper: [],
    andreUtbetalinger: [],
  },
  registrerteBarn: [],
  andreBarn: [],
  tilleggsopplysninger: søknad?.tilleggsopplysninger,
});

export const StandardPage = (): JSX.Element => {
  const [oppslagLoading, setOppslagLoading] = useState<boolean>(true);
  const [showVeiledning, setShowVeiledning] = useState<boolean>(true);
  const [showKvittering, setShowKvittering] = useState<boolean>(false);
  const { søknadState, søknadDispatch } = useSoknadContext();
  const { oppslagDispatch, søker, fastlege } = useSokerOppslag();
  const { currentStep, stepWizardDispatch } = useStepWizard();
  const { getText } = useTexts(tekster);
  useEffect(() => {
    const getSoknadStateAndOppslag = async () => {
      // Wait to test cache
      // const cachedState = await hentSoknadState(søknadDispatch, SøknadType.HOVED);
      // if (cachedState?.lagretStepList) {
      //   setStepList([...cachedState.lagretStepList], stepWizardDispatch);
      // }
      const oppslag = await hentSokerOppslag(oppslagDispatch);
      setOppslagLoading(false);
      if (oppslag?.søker?.barn) addBarnIfMissing(søknadDispatch, oppslag.søker.barn);
    };
    getSoknadStateAndOppslag();
  }, []);
  const submitSoknad: SubmitHandler<Soknad> = async (data) => {
    if (currentStep?.name === StepNames.OPPSUMMERING) {
      console.log('post søknad', søknadState?.søknad);

      // Må massere dataene litt før vi sender de inn
      const søknad = mapSøknadToBackend(søknadState?.søknad);

      console.log('søknad', søknad);

      const postResponse = await postSøknad(søknad);
      if (postResponse?.ok) {
        setShowKvittering(true);
      } else {
        // show post error
      }
      setTimeout(() => {
        setShowKvittering(true);
      }, 2000);
    } else {
      completeAndGoToNextStep(stepWizardDispatch);
    }
  };
  const postSøknad = async (data?: any) =>
    fetchPOST('/aap/soknad-api/innsending/soknad', {
      ...data,
    });
  const onPreviousStep = () => {
    if (currentStep?.name === StepNames.STARTDATO) {
      setShowVeiledning(true);
    } else {
      goToPreviousStep(stepWizardDispatch);
    }
  };
  const onDeleteSøknad = async () => {
    if (søknadState.type) {
      const deleteRes = await slettLagretSoknadState(søknadDispatch, søknadState.type);
      if (deleteRes) {
        resetStepWizard(stepWizardDispatch);
      } else {
        console.error('noe gikk galt med sletting av lagret søknad');
      }
    }
  };
  if (showKvittering)
    return (
      <>
        <PageHeader align="center" className={classes?.pageHeader}>
          {getText('pagetitle')}
        </PageHeader>
        <Kvittering getText={getText} søker={søker} />
      </>
    );
  if (showVeiledning)
    return (
      <Veiledning
        onSubmit={() => setShowVeiledning(false)}
        getText={getText}
        søker={søker}
        loading={oppslagLoading}
      />
    );
  return (
    <>
      <header>
        <PageHeader align="center">{getText('pagetitle')}</PageHeader>
      </header>
      <StepWizard hideLabels={true}>
        <Step order={1} name={StepNames.STARTDATO} label={'Søknadsdato'}>
          <StartDato
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>
        <Step order={2} name={StepNames.MEDLEMSKAP} label={'Tilknytning til Norge'}>
          <Medlemskap
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>
        <Step order={3} name={StepNames.YRKESSKADE} label={'Yrkesskade'}>
          <Yrkesskade
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>

        <Step order={4} name={StepNames.FASTLEGE} label={'Fastlege'}>
          <Behandlere
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
            fastlege={fastlege}
          />
        </Step>
        <Step order={5} name={StepNames.BARNETILLEGG} label={'Barnetilleggg'}>
          <Barnetillegg
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>
        <Step order={6} name={StepNames.STUDENT} label={'Student'}>
          <Student
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>
        <Step order={7} name={StepNames.ANDRE_UTBETALINGER} label={'Andre utbetalinger'}>
          <AndreUtbetalinger
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>
        <Step order={8} name={StepNames.TILLEGGSOPPLYSNINGER} label={'Tilleggsopplysninger'}>
          <Tilleggsopplysninger
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>
        <Step order={9} name={StepNames.VEDLEGG} label={'Vedlegg'}>
          <Vedlegg
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>
        <Step order={10} name={StepNames.OPPSUMMERING} label={'Oppsummering'}>
          <Oppsummering
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            onSubmitSoknad={submitSoknad}
          />
        </Step>
      </StepWizard>
    </>
  );
};

export default StandardPage;
