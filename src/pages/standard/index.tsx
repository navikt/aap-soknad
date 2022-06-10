import React, { useEffect, useRef, useState } from 'react';
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
  setStepList,
} from '../../context/stepWizardContextV2';
import Soknad from '../../types/Soknad';
import {
  useSoknadContext,
  slettLagretSoknadState,
  addBarnIfMissing,
} from '../../context/soknadContext';
import { Veiledning } from './Veiledning/Veiledning';
import { FastlegeView, hentSokerOppslag, useSokerOppslag } from '../../context/sokerOppslagContext';
import { Behandlere } from './Behandlere/Behandlere';
import { Medlemskap } from './Medlemskap/Medlemskap';
import { Yrkesskade } from './Yrkesskade/Yrkesskade';
import { AndreUtbetalinger, StønadType } from './AndreUtbetalinger/AndreUtbetalinger';
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
const defaultStepList = [
  { name: StepNames.STARTDATO, active: true },
  { name: StepNames.MEDLEMSKAP },
  { name: StepNames.YRKESSKADE },
  { name: StepNames.FASTLEGE },
  { name: StepNames.BARNETILLEGG },
  { name: StepNames.STUDENT },
  { name: StepNames.ANDRE_UTBETALINGER },
  { name: StepNames.TILLEGGSOPPLYSNINGER },
  { name: StepNames.VEDLEGG },
  { name: StepNames.OPPSUMMERING },
];

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

const getJaNeiAvbrutt = (value?: string) => {
  if (value === 'Ja') return 'JA';
  if (value === 'Nei') return 'NEI';
  if (value === 'Avbrutt') return 'AVBRUTT';
  return undefined;
};

const jaNeiToBoolean = (value?: string) => {
  if (value === 'Ja') return true;
  if (value === 'Nei') return false;
  return undefined;
};

interface SøknadBackendState {
  startDato: {
    fom?: string;
    hvorfor?: string;
    beskrivelse?: string;
  };
  ferie: {
    ferieType?: 'PERIODE' | 'DAGER' | 'NEI' | 'VET_IKKE';
    periode?: {
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
  studier: {
    erStudent?: 'JA' | 'NEI' | 'AVBRUTT';
    kommeTilbake?: 'JA' | 'NEI' | 'VET_IKKE';
  };
  behandlere: Array<Behandler>;
  yrkesskadeType?: 'JA' | 'NEI' | 'VET_IKKE';
  utbetalinger: {
    fraArbeidsgiver?: boolean;
    andreStønader: Array<{ type: StønadType; hvemUtbetalerAFP?: string; vedlegg?: string }>;
  };
  registrerteBarn: Array<{
    fnr: string;
    merEnnIG?: boolean;
    barnepensjon?: boolean;
  }>;
  andreBarn: Array<{
    barn: {
      fnr: string;
      navn: {
        fornavn?: string;
        mellomnavn?: string;
        etternavn?: string;
      };
    };
    relasjon: 'FORELDER' | 'FOSTERFORELDER';
    merEnnIG?: boolean;
    barnepensjon?: boolean;
  }>;
  tilleggsopplysninger?: string;
}

interface Behandler {
  type: 'FASTLEGE' | 'ANNEN_BEHANDLER';
  navn: { fornavn?: string; mellomnavn?: string; etternavn?: string };
  kontaktinformasjon: {
    behandlerRef?: string;
    kontor?: string;
    orgnummer?: string;
    adresse?: {
      adressenavn?: string;
      husbokstav?: string;
      husnummer?: string;
      postnummer?: { postnr: string; poststed?: string };
    };
    telefon?: string;
  };
}

const mapFastlege = (fastlege?: FastlegeView): Behandler[] => {
  if (fastlege) {
    return [
      {
        type: 'FASTLEGE',
        navn: fastlege.originalNavn,
        kontaktinformasjon: {
          behandlerRef: fastlege.behandlerRef,
          kontor: fastlege.legekontor,
          orgnummer: fastlege.orgnummer,
          telefon: fastlege.telefon,
          adresse: fastlege.originalAdresse,
        },
      },
    ];
  }
  return [];
};

const mapSøknadToBackend = (søknad?: Soknad, fastlege?: FastlegeView): SøknadBackendState => {
  const ferieType = getFerieType(søknad?.ferie?.skalHaFerie, søknad?.ferie?.ferieType);
  const mappedFastlege = mapFastlege(fastlege);

  const behandlere = mappedFastlege.concat(
    søknad?.behandlere?.map((behandler) => {
      return {
        type: 'ANNEN_BEHANDLER',
        navn: {
          fornavn: behandler.firstname,
          etternavn: behandler.lastname,
        },
        kontaktinformasjon: {
          kontor: behandler.legekontor,
          telefon: behandler.telefon,
          adresse: {
            adressenavn: behandler.gateadresse,
            postnummer: {
              postnr: behandler.postnummer,
              poststed: behandler.poststed,
            },
          },
        },
      };
    }) ?? []
  );

  return {
    startDato: {
      fom: formatDate(søknad?.startDato),
      hvorfor: getHvorfor(søknad?.hvorfor),
      beskrivelse: søknad?.begrunnelse,
    },
    ferie: {
      ferieType,
      ...(ferieType === 'PERIODE' && {
        periode: {
          fom: formatDate(søknad?.ferie?.fraDato),
          tom: formatDate(søknad?.ferie?.tilDato),
        },
      }),
      dager: søknad?.ferie?.antallDager,
    },
    medlemsskap: {
      boddINorgeSammenhengendeSiste5: jaNeiToBoolean(søknad?.medlemskap?.harBoddINorgeSiste5År),
      jobbetUtenforNorgeFørSyk: jaNeiToBoolean(søknad?.medlemskap?.arbeidetUtenforNorgeFørSykdom),
      jobbetSammenhengendeINorgeSiste5: jaNeiToBoolean(
        søknad?.medlemskap?.harArbeidetINorgeSiste5År
      ),
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
    studier: {
      erStudent: getJaNeiAvbrutt(søknad?.student?.erStudent),
      kommeTilbake: getJaNeiVetIkke(søknad?.student?.kommeTilbake),
    },
    behandlere,
    yrkesskadeType: getJaNeiVetIkke(søknad?.yrkesskade),
    utbetalinger: {
      fraArbeidsgiver: jaNeiToBoolean(søknad?.andreUtbetalinger?.lønn),
      andreStønader:
        søknad?.andreUtbetalinger?.stønad?.map((stønad) => {
          return {
            type: stønad,
            ...(stønad === StønadType.AFP && {
              hvemUtbetalerAFP: søknad?.andreUtbetalinger?.afp?.hvemBetaler,
            }),
            vedlegg: undefined,
          };
        }) ?? [],
    },
    registrerteBarn:
      søknad?.barnetillegg?.map((barn) => ({
        fnr: barn.fnr,
        merEnnIG: jaNeiToBoolean(barn.harInntekt),
        barnepensjon: jaNeiToBoolean(barn.barnepensjon),
      })) ?? [],
    andreBarn:
      søknad?.manuelleBarn?.map((barn) => ({
        barn: {
          fnr: barn.fnr,
          navn: barn.navn,
        },
        relasjon: barn.relasjon,
        merEnnIG: jaNeiToBoolean(barn.harInntekt),
        barnepensjon: jaNeiToBoolean(barn.barnepensjon),
      })) ?? [],
    tilleggsopplysninger: søknad?.tilleggsopplysninger,
  };
};

export const StandardPage = (): JSX.Element => {
  const [oppslagLoading, setOppslagLoading] = useState<boolean>(true);
  const [showVeiledning, setShowVeiledning] = useState<boolean>(true);
  const [showKvittering, setShowKvittering] = useState<boolean>(false);
  const { søknadState, søknadDispatch } = useSoknadContext();
  const { oppslagDispatch, søker, fastlege } = useSokerOppslag();
  const { currentStep, stepWizardDispatch } = useStepWizard();
  const { getText } = useTexts(tekster);
  const pageHeading = useRef(null);
  useEffect(() => {
    const getSoknadStateAndOppslag = async () => {
      // Wait to test cache
      // const cachedState = await hentSoknadState(søknadDispatch, SøknadType.HOVED);
      // if (cachedState?.lagretStepList) {
      //   setShowVeiledning(false);
      //   setStepList([...cachedState.lagretStepList], stepWizardDispatch);
      // } else {
      //   setStepList([...defaultStepList], stepWizardDispatch);
      // }
      setStepList([...defaultStepList], stepWizardDispatch);
      const oppslag = await hentSokerOppslag(oppslagDispatch);
      setOppslagLoading(false);
      if (oppslag?.søker?.barn) addBarnIfMissing(søknadDispatch, oppslag.søker.barn);
    };
    getSoknadStateAndOppslag();
  }, []);
  useEffect(() => {
    window && window.scrollTo(0, 0);
    pageHeading?.current?.focus();
  }, [currentStep]);
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
        <PageHeader tabIndex={-1} ref={pageHeading} align="center">
          {getText('pagetitle')}
        </PageHeader>
      </header>
      <StepWizard hideLabels={true}>
        <Step order={1} name={StepNames.STARTDATO}>
          <StartDato
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>
        <Step order={2} name={StepNames.MEDLEMSKAP}>
          <Medlemskap
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>
        <Step order={3} name={StepNames.YRKESSKADE}>
          <Yrkesskade
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>

        <Step order={4} name={StepNames.FASTLEGE}>
          <Behandlere
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
            fastlege={fastlege}
          />
        </Step>
        <Step order={5} name={StepNames.BARNETILLEGG}>
          <Barnetillegg
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>
        <Step order={6} name={StepNames.STUDENT}>
          <Student
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>
        <Step order={7} name={StepNames.ANDRE_UTBETALINGER}>
          <AndreUtbetalinger
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>
        <Step order={8} name={StepNames.TILLEGGSOPPLYSNINGER}>
          <Tilleggsopplysninger
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>
        <Step order={9} name={StepNames.VEDLEGG}>
          <Vedlegg
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>
        <Step order={10} name={StepNames.OPPSUMMERING}>
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
