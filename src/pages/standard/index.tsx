import React, { useEffect, useRef, useState } from 'react';
import { PageHeader } from '@navikt/ds-react';
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
import { hentSoknadState, slettLagretSoknadState } from '../../context/soknadContextCommon';
import { useSoknadContextStandard, addBarnIfMissing } from '../../context/soknadContextStandard';
import { Veiledning } from './Veiledning/Veiledning';
import { FastlegeView, hentSokerOppslag, useSokerOppslag } from '../../context/sokerOppslagContext';
import { updateSøknadData } from '../../context/soknadContextCommon';
import { Behandlere } from './Behandlere/Behandlere';
import { Medlemskap } from './Medlemskap/Medlemskap';
import { Yrkesskade } from './Yrkesskade/Yrkesskade';
import {
  AndreUtbetalinger,
  AttachmentType,
  StønadType,
} from './AndreUtbetalinger/AndreUtbetalinger';
import { Barnetillegg } from './Barnetillegg/Barnetillegg';
import Oppsummering from './Oppsummering/Oppsummering';
import Tilleggsopplysninger from './Tilleggsopplysninger/Tilleggsopplysninger';
import Vedlegg from './Vedlegg/Vedlegg';
import StartDato from './StartDato/StartDato';
import Student, { AVBRUTT_STUDIE_VEDLEGG } from './Student/Student';
import Kvittering from './Kvittering/Kvittering';
import { fetchPOST } from '../../api/fetch';
import * as classes from './standard.module.css';
import { format } from 'date-fns';
import { useFeatureToggleIntl } from '../../hooks/useFeatureToggleIntl';
import { SøknadType } from '../../types/SoknadContext';
import { useDebounceLagreSoknad } from '../../hooks/useDebounceLagreSoknad';
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
export const defaultStepList = [
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
    vedlegg?: Array<string>;
  };
  behandlere: Array<Behandler>;
  yrkesskadeType?: 'JA' | 'NEI' | 'VET_IKKE';
  utbetalinger: {
    fraArbeidsgiver?: boolean;
    andreStønader: Array<{ type: StønadType; hvemUtbetalerAFP?: string; vedlegg?: Array<string> }>;
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

export const mapSøknadToBackend = (
  søknad?: Soknad,
  fastlege?: FastlegeView
): SøknadBackendState => {
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
      fom: formatDate(new Date()),
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
      ...(søknad?.vedlegg?.[AVBRUTT_STUDIE_VEDLEGG]?.[0]?.vedleggId
        ? {
            vedlegg:
              søknad?.vedlegg?.[AVBRUTT_STUDIE_VEDLEGG]?.map((vedlegg) => vedlegg.vedleggId) ?? [],
          }
        : {}),
    },
    behandlere,
    yrkesskadeType: getJaNeiVetIkke(søknad?.yrkesskade),
    utbetalinger: {
      ...(søknad?.andreUtbetalinger?.lønn
        ? {
            ekstraFraArbeidsgiver: {
              fraArbeidsgiver: jaNeiToBoolean(søknad?.andreUtbetalinger?.lønn),
              vedlegg:
                søknad?.vedlegg?.[AttachmentType.LØNN_OG_ANDRE_GODER]?.map(
                  (vedlegg) => vedlegg.vedleggId
                ) ?? [],
            },
          }
        : {}),
      andreStønader:
        søknad?.andreUtbetalinger?.stønad?.map((stønad) => {
          switch (stønad) {
            case StønadType.AFP:
              return {
                type: stønad,
                hvemUtbetalerAFP: søknad?.andreUtbetalinger?.afp?.hvemBetaler,
              };
            case StønadType.OMSORGSSTØNAD:
              return {
                type: stønad,
                vedlegg:
                  søknad?.vedlegg?.[AttachmentType.OMSORGSSTØNAD]?.map(
                    (vedlegg) => vedlegg.vedleggId
                  ) ?? [],
              };
            case StønadType.UTLAND:
              return {
                type: stønad,
                vedlegg:
                  søknad?.vedlegg?.[AttachmentType.UTLANDSSTØNAD]?.map(
                    (vedlegg) => vedlegg.vedleggId
                  ) ?? [],
              };
            default:
              return { type: stønad };
          }
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
        vedlegg: barn?.vedlegg?.map((e) => e?.vedleggId),
      })) ?? [],
    tilleggsopplysninger: søknad?.tilleggsopplysninger,
    ...(søknad?.vedlegg?.annet
      ? { andreVedlegg: søknad?.vedlegg?.annet?.map((e) => e?.vedleggId) }
      : {}),
  };
};

export const StandardPage = (): JSX.Element => {
  const { formatMessage } = useFeatureToggleIntl();

  const [oppslagLoading, setOppslagLoading] = useState<boolean>(true);
  const [showVeiledning, setShowVeiledning] = useState<boolean>(true);
  const [showKvittering, setShowKvittering] = useState<boolean>(false);
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { oppslagDispatch, søker, fastlege } = useSokerOppslag();
  const { currentStep, stepList, stepWizardDispatch } = useStepWizard();
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  const pageHeading = useRef(null);
  useEffect(() => {
    const getSoknadStateAndOppslag = async () => {
      // Wait to test cache
      const cachedState = await hentSoknadState<Soknad>(søknadDispatch, SøknadType.STANDARD);
      if (cachedState?.lagretStepList && cachedState?.lagretStepList?.length > 0) {
        setShowVeiledning(false);
        setStepList([...cachedState.lagretStepList], stepWizardDispatch);
      } else {
        setStepList([...defaultStepList], stepWizardDispatch);
      }
      const oppslag = await hentSokerOppslag(oppslagDispatch);
      setOppslagLoading(false);
      if (oppslag?.søker?.barn) addBarnIfMissing(søknadDispatch, oppslag.søker.barn);
    };
    getSoknadStateAndOppslag();
  }, []);
  useEffect(() => {
    if (søknadState?.søknad && Object.keys(søknadState?.søknad)?.length > 0) {
      debouncedLagre(søknadState, stepList, {});
    }
  }, [currentStep, stepList]);
  useEffect(() => {
    window && window.scrollTo(0, 0);
    if (pageHeading?.current != null) (pageHeading?.current as HTMLElement)?.focus();
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
      const deleteRes = await slettLagretSoknadState<Soknad>(søknadDispatch, søknadState);
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
          {formatMessage('søknad.pagetitle')}
        </PageHeader>
        <Kvittering søker={søker} />
      </>
    );
  if (showVeiledning)
    return (
      <Veiledning
        onSubmit={() => setShowVeiledning(false)}
        søker={søker}
        loading={oppslagLoading}
      />
    );
  return (
    <>
      <header>
        <PageHeader tabIndex={-1} ref={pageHeading} align="center">
          {formatMessage('søknad.pagetitle')}
        </PageHeader>
      </header>
      <StepWizard hideLabels={true}>
        <Step order={1} name={StepNames.STARTDATO}>
          <StartDato
            onBackClick={onPreviousStep}
            onNext={(data) => {
              updateSøknadData<Soknad>(søknadDispatch, data);
              completeAndGoToNextStep(stepWizardDispatch);
            }}
          />
        </Step>
        <Step order={2} name={StepNames.MEDLEMSKAP}>
          <Medlemskap
            onBackClick={onPreviousStep}
            onNext={(data) => {
              updateSøknadData<Soknad>(søknadDispatch, data);
              completeAndGoToNextStep(stepWizardDispatch);
            }}
          />
        </Step>
        <Step order={3} name={StepNames.YRKESSKADE}>
          <Yrkesskade
            onBackClick={onPreviousStep}
            onNext={(data) => {
              updateSøknadData<Soknad>(søknadDispatch, data);
              completeAndGoToNextStep(stepWizardDispatch);
            }}
          />
        </Step>

        <Step order={4} name={StepNames.FASTLEGE}>
          <Behandlere
            onBackClick={onPreviousStep}
            onNext={(data) => {
              updateSøknadData<Soknad>(søknadDispatch, data);
              completeAndGoToNextStep(stepWizardDispatch);
            }}
            fastlege={fastlege}
          />
        </Step>
        <Step order={5} name={StepNames.BARNETILLEGG}>
          <Barnetillegg
            onBackClick={onPreviousStep}
            onNext={(data) => {
              updateSøknadData<Soknad>(søknadDispatch, data);
              completeAndGoToNextStep(stepWizardDispatch);
            }}
          />
        </Step>
        <Step order={6} name={StepNames.STUDENT}>
          <Student
            onBackClick={onPreviousStep}
            onNext={(data) => {
              updateSøknadData<Soknad>(søknadDispatch, data);
              completeAndGoToNextStep(stepWizardDispatch);
            }}
          />
        </Step>
        <Step order={7} name={StepNames.ANDRE_UTBETALINGER}>
          <AndreUtbetalinger
            onBackClick={onPreviousStep}
            onNext={(data) => {
              updateSøknadData<Soknad>(søknadDispatch, data);
              completeAndGoToNextStep(stepWizardDispatch);
            }}
          />
        </Step>
        <Step order={8} name={StepNames.TILLEGGSOPPLYSNINGER}>
          <Tilleggsopplysninger
            onBackClick={onPreviousStep}
            onNext={(data) => {
              updateSøknadData<Soknad>(søknadDispatch, data);
              completeAndGoToNextStep(stepWizardDispatch);
            }}
          />
        </Step>
        <Step order={9} name={StepNames.VEDLEGG}>
          <Vedlegg
            onBackClick={onPreviousStep}
            onNext={(data) => {
              updateSøknadData<Soknad>(søknadDispatch, data);
              completeAndGoToNextStep(stepWizardDispatch);
            }}
          />
        </Step>
        <Step order={10} name={StepNames.OPPSUMMERING}>
          <Oppsummering onBackClick={onPreviousStep} onSubmitSoknad={submitSoknad} />
        </Step>
      </StepWizard>
    </>
  );
};

export default StandardPage;
