import { AVBRUTT_STUDIE_VEDLEGG } from 'components/pageComponents/standard/Student/Student';
import {
  AttachmentType,
  StønadType,
} from 'components/pageComponents/standard/AndreUtbetalinger/AndreUtbetalinger';
import { FastlegeView } from 'context/sokerOppslagContext';
import { Soknad, Behandler } from 'types/Soknad';
import { SøknadBackendState } from 'types/SoknadBackendState';
import { formatDate } from './date';

export type SøknadsType = 'UTLAND' | 'STANDARD';

export const GYLDIGE_SØKNADS_TYPER = ['UTLAND', 'STANDARD'];

export const erGyldigSøknadsType = (type?: string) =>
  typeof type === 'undefined' || !GYLDIGE_SØKNADS_TYPER.includes(type);

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
      beskrivelse: søknad?.begrunnelse,
    },
    ferie: {
      ferieType,
      ...(ferieType === 'PERIODE' && {
        periode: {
          fom: formatDate(søknad?.ferie?.fraDato, 'yyyy-MM-dd'),
          tom: formatDate(søknad?.ferie?.tilDato, 'yyyy-MM-dd'),
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
            fom: formatDate(utenlandsopphold.fraDato, 'yyyy-MM-dd'),
            tom: formatDate(utenlandsopphold.tilDato, 'yyyy-MM-dd'),
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
        merEnnIG: jaNeiToBoolean(barn.harInntekt),
        barnepensjon: jaNeiToBoolean(barn.barnepensjon),
      })) ?? [],
    andreBarn:
      søknad?.manuelleBarn?.map((barn) => ({
        barn: {
          fødseldato: formatDate(barn.fødseldato, 'yyyy-MM-dd'),
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
