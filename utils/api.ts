import {
  AVBRUTT_STUDIE_VEDLEGG,
  STUDENT,
  ER_STUDENT,
  jaNeiAvbruttToTekstnøkkel,
  KOMME_TILBAKE,
} from 'components/pageComponents/standard/Student/Student';
import {
  AttachmentType,
  StønadType,
  stønadTypeToAlternativNøkkel,
} from 'components/pageComponents/standard/AndreUtbetalinger/AndreUtbetalinger';
import { FastlegeView, Soker } from 'context/sokerOppslagContext';
import { Soknad } from 'types/Soknad';
import { BehandlerBackendState, SøknadBackendState } from 'types/SoknadBackendState';
import { formatDate, formatDateTime } from './date';
import { formatNavn, getFullAdresse } from 'utils/StringFormatters';
import { GRUNNBELØP } from 'components/pageComponents/standard/Barnetillegg/Barnetillegg';
import { RequiredVedlegg } from 'types/SoknadContext';
import { Relasjon } from 'components/pageComponents/standard/Barnetillegg/AddBarnModal';

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

export const mapSøknadToBackend = (
  søknad?: Soknad,
  fastlege?: FastlegeView
): SøknadBackendState => {
  const ferieType = getFerieType(søknad?.ferie?.skalHaFerie, søknad?.ferie?.ferieType);
  const registrerteBehandlere: BehandlerBackendState[] =
    søknad?.registrerteBehandlere?.map((behandler) => ({
      ...behandler,
      erRegistrertFastlegeRiktig: jaNeiToBoolean(behandler.erRegistrertFastlegeRiktig),
    })) ?? [];

  const andreBehandlere: BehandlerBackendState[] =
    søknad?.andreBehandlere?.map((behandler) => {
      return {
        type: 'SYKMELDER',
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
    }) ?? [];

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
          arbeidet: jaNeiToBoolean(utenlandsopphold.iArbeid),
          id: utenlandsopphold.utenlandsId,
          landsNavn: '', // TODO: Hente navn fra landkode
        })) ?? [],
    },
    studier: {
      erStudent: getJaNeiAvbrutt(søknad?.student?.erStudent),
      kommeTilbake: getJaNeiVetIkke(søknad?.student?.kommeTilbake),
      vedlegg: søknad?.vedlegg?.[AVBRUTT_STUDIE_VEDLEGG]?.map((vedlegg) => vedlegg.vedleggId) ?? [],
    },
    registrerteBehandlere,
    andreBehandlere,
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
const createField = (felt: string, verdi: string | undefined, skipIfFalsy = false) =>
  skipIfFalsy && !verdi
    ? []
    : [
        {
          type: 'FELT',
          felt,
          verdi,
        },
      ];
const createFritekst = (tekst: string, skipIfFalsy = false) =>
  skipIfFalsy && !tekst
    ? []
    : [
        {
          type: 'FRITEKST',
          tekst,
        },
      ];
const createTabellrad = (
  venstretekst: string,
  høyretekst: string | undefined,
  skipIfFalsy = false
) =>
  skipIfFalsy && !høyretekst
    ? []
    : [
        {
          type: 'TABELLRAD',
          venstretekst,
          høyretekst,
        },
      ];
const createGruppe = (overskrift: string, tabellrader: any[]) => ({
  type: 'GRUPPE',
  overskrift,
  tabellrader,
});
const createGruppeliste = (overskrift: string, tabellrader: any[]) => ({
  type: 'GRUPPELISTE',
  overskrift,
  tabellrader,
});
const createTema = (overskrift: string, rader: any[]) => ({
  type: 'TEMA',
  overskrift,
  underblokker: rader,
});
const createListe = (tittel: string, punkter?: any[]) => ({
  type: 'LISTE',
  tittel,
  punkter: punkter || [],
});

export const mapSøknadToPdf = (
  søknad?: Soknad,
  sendtTimestamp?: Date,
  formatMessage?: any,
  requiredVedlegg?: RequiredVedlegg[],
  søker?: Soker
) => {
  const getStartDato = (søknad?: Soknad) => {
    const begrunnelse = søknad?.begrunnelse
      ? [
          createGruppe(
            'Fritekst - Ønsker startdato tilbake i tid',
            createFritekst(søknad?.begrunnelse)
          ),
        ]
      : [];
    const rows = [
      ...begrunnelse,
      ...createField(
        formatMessage('søknad.startDato.skalHaFerie.label'),
        søknad?.ferie?.skalHaFerie
      ),
      ...createField(formatMessage('søknad.startDato.ferieType.label'), søknad?.ferie?.ferieType),
      ...createField(
        'Periode',
        søknad?.ferie?.fraDato
          ? `Fra ${søknad?.ferie?.fraDato} til ${søknad?.ferie?.tilDato}`
          : undefined,
        true
      ),
      ...createField('Antall dager', søknad?.ferie?.antallDager, true),
    ];
    return createTema('Startdato', rows);
  };
  const getMedlemskap = (søknad?: Soknad) => {
    const utenlandsOpphold = søknad?.medlemskap?.utenlandsOpphold
      ? [
          createGruppe(
            'Utenlandsopphold',
            søknad?.medlemskap?.utenlandsOpphold?.map((opphold) =>
              createGruppeliste('', [
                ...createTabellrad('Land', opphold?.land),
                ...createTabellrad(
                  'Periode',
                  `Fra ${formatDate(opphold?.fraDato)} til ${formatDate(opphold?.tilDato)}`
                ),
                ...createTabellrad(
                  formatMessage('søknad.medlemskap.utenlandsperiode.modal.iArbeid.label'),
                  opphold?.iArbeid
                ),
                ...createTabellrad(
                  formatMessage('søknad.medlemskap.utenlandsperiode.modal.utenlandsId.label'),
                  opphold?.utenlandsId,
                  true
                ),
              ])
            )
          ),
        ]
      : [];
    const rader = [
      ...createField(
        formatMessage('søknad.medlemskap.harBoddINorgeSiste5År.label'),
        søknad?.medlemskap?.harBoddINorgeSiste5År
      ),
      ...createField(
        formatMessage('søknad.medlemskap.harArbeidetINorgeSiste5År.label'),
        søknad?.medlemskap?.harArbeidetINorgeSiste5År,
        true
      ),
      ...createField(
        formatMessage('søknad.medlemskap.arbeidUtenforNorge.label'),
        søknad?.medlemskap?.arbeidetUtenforNorgeFørSykdom,
        true
      ),
      ...createField(
        formatMessage('søknad.medlemskap.iTilleggArbeidUtenforNorge.label'),
        søknad?.medlemskap?.iTilleggArbeidUtenforNorge,
        true
      ),
      ...utenlandsOpphold,
    ];
    return createTema('Tilknytning til Norge', rader);
  };
  const getYrkesskade = (søknad?: Soknad) => {
    return createTema('Yrkesskade', [
      ...createField(formatMessage(`søknad.yrkesskade.harDuYrkesskade.label`), søknad?.yrkesskade),
    ]);
  };
  const getRegistrerteBehandlere = (søknad?: Soknad) => {
    const registrerteBehandlere =
      søknad?.registrerteBehandlere?.map((behandler) =>
        createGruppeliste('', [
          ...createTabellrad('Type', behandler?.type),
          ...createTabellrad('Kategori', behandler?.kategori),
          ...createTabellrad('Navn', formatNavn(behandler?.navn)),
          ...createTabellrad('Kontor', behandler?.kontaktinformasjon?.kontor),
          ...createTabellrad('Adresse', getFullAdresse(behandler?.kontaktinformasjon?.adresse)),
          ...createTabellrad('Telefon', behandler?.kontaktinformasjon?.telefon),
          ...createTabellrad(
            formatMessage(`søknad.helseopplysninger.erRegistrertFastlegeRiktig.label`),
            behandler?.erRegistrertFastlegeRiktig
          ),
        ])
      ) || [];
    return createTema('Registrerte behandlere', registrerteBehandlere);
  };
  const getAndreBehandlere = (søknad?: Soknad) => {
    const andreBehandlere =
      søknad?.andreBehandlere?.map((behandler) =>
        createGruppeliste('', [
          ...createTabellrad(
            'Navn',
            formatNavn({ fornavn: behandler?.firstname, etternavn: behandler?.lastname })
          ),
          ...createTabellrad('Kontor', behandler?.legekontor),
          ...createTabellrad(
            'Adresse',
            getFullAdresse({
              adressenavn: behandler?.gateadresse,
              postnummer: {
                postnr: behandler?.postnummer,
                poststed: behandler?.poststed,
              },
            })
          ),
          ...createTabellrad('Telefon', behandler?.telefon),
        ])
      ) || [];
    return createTema('Andre behandlere', andreBehandlere);
  };
  const getBarn = (søknad?: Soknad) => {
    const registrerteBarn =
      søknad?.barnetillegg?.map((barn) =>
        createGruppeliste('', [
          ...createTabellrad('Navn', formatNavn(barn?.navn)),
          ...createTabellrad('Fødselsdato', barn?.fødseldato || ''),
          ...createTabellrad(
            formatMessage('søknad.barnetillegg.registrerteBarn.barnepensjon.label'),
            barn?.barnepensjon
          ),
          ...createTabellrad(
            formatMessage('søknad.barnetillegg.registrerteBarn.harInntekt.label', {
              grunnbeløp: GRUNNBELØP,
            }),
            barn?.harInntekt,
            true
          ),
        ])
      ) || [];
    const andreBarn =
      søknad?.manuelleBarn?.map((barn) =>
        createGruppe('', [
          ...createTabellrad('Navn', formatNavn(barn?.navn)),
          ...createTabellrad('Fødselsdato', barn?.fødseldato ? formatDate(barn.fødseldato) : ''),
          ...createTabellrad(
            formatMessage('søknad.barnetillegg.leggTilBarn.modal.relasjon.label'),
            barn?.relasjon
          ),
          ...createTabellrad(
            formatMessage('søknad.barnetillegg.registrerteBarn.barnepensjon.label'),
            barn?.barnepensjon
          ),
          ...createTabellrad(
            formatMessage(
              'søknad.barnetillegg.registrerteBarn.harInntekt.label',
              {
                grunnbeløp: GRUNNBELØP,
              },
              true
            ),
            barn?.harInntekt
          ),
        ])
      ) || [];
    return createTema('Barn', [...registrerteBarn, ...andreBarn]);
  };
  const getAndreYtelser = (søknad?: Soknad) => {
    const stønader =
      søknad?.andreUtbetalinger?.stønad?.map(
        (stønadType) =>
          createTabellrad(
            formatMessage(stønadTypeToAlternativNøkkel(stønadType)),
            stønadType === StønadType.AFP
              ? `Utbetaler: ${søknad?.andreUtbetalinger?.afp?.hvemBetaler}`
              : ''
          )[0]
      ) || [];
    return createTema('Andre ytelser', [
      ...createField(
        formatMessage('søknad.andreUtbetalinger.lønn.label'),
        formatMessage(`answerOptions.jaEllerNei.${søknad?.andreUtbetalinger?.lønn}`)
      ),
      createGruppe(formatMessage('søknad.andreUtbetalinger.stønad.label'), stønader),
    ]);
  };
  const getStudent = (søknad?: Soknad) => {
    return createTema('Student', [
      ...createField(
        formatMessage(`søknad.${STUDENT}.${ER_STUDENT}.legend`),
        søknad?.student?.erStudent
          ? formatMessage(jaNeiAvbruttToTekstnøkkel(søknad?.student?.erStudent))
          : ''
      ),
      ...createField(
        formatMessage(`søknad.${STUDENT}.${KOMME_TILBAKE}.legend`),
        søknad?.student?.kommeTilbake
      ),
    ]);
  };
  const getTilleggsopplysninger = (søknad?: Soknad) => {
    return createTema('Tillegsopplysninger', [
      createGruppe(
        formatMessage(`søknad.tilleggsopplysninger.tilleggsopplysninger.label`),
        createFritekst(søknad?.begrunnelse || 'Ingen tilleggsopplysninger')
      ),
    ]);
  };
  const getVedlegg = (søknad?: Soknad, requiredVedlegg?: RequiredVedlegg[]) => {
    const opplastedeVedlegg = requiredVedlegg?.filter((vedlegg) => vedlegg?.completed) || [];
    const ordinæreVedlegg = opplastedeVedlegg
      ?.filter(
        (e) => e?.filterType !== Relasjon.FORELDER && e?.filterType !== Relasjon.FOSTERFORELDER
      )
      .map((vedlegg) => {
        const vedleggListe = søknad?.vedlegg?.[vedlegg?.type]?.map((file) => file?.name);
        return createGruppe(vedlegg?.description, [createListe('', vedleggListe)]);
      });
    const manuelleBarnVedlegg =
      søknad?.manuelleBarn?.map((barn) => {
        const label = requiredVedlegg?.find(
          (e) => e.type === `barn-${barn.internId}` && e.completed
        )?.description;
        return createGruppe(label || '', [
          createListe(
            '',
            barn?.vedlegg?.map((vedlegg) => vedlegg?.name)
          ),
        ]);
      }) || [];
    const andreVedlegg =
      søknad?.vedlegg?.annet && søknad?.vedlegg?.annet?.length > 0
        ? [
            createGruppe('Annet', [
              createListe(
                '',
                søknad?.vedlegg?.annet?.map((vedleggFile) => vedleggFile?.name)
              ),
            ]),
          ]
        : [];
    return createTema('Vedlegg', [...ordinæreVedlegg, ...manuelleBarnVedlegg, ...andreVedlegg]);
  };
  const getManglendeVedlegg = (søknad?: Soknad, requiredVedlegg?: RequiredVedlegg[]) => {
    const manglendeVedlegg = requiredVedlegg
      ?.filter((vedlegg) => !vedlegg?.completed)
      ?.map((e) => e?.description);
    return createTema('Manglende vedlegg', [
      createListe('', manglendeVedlegg),
      ...createFritekst(formatMessage('søknad.ettersendelseFrist')),
    ]);
  };
  return {
    søker: {
      id: søker?.fødseldato,
      navn: formatNavn(søker?.navn),
    },
    mottattdato: {
      beskrivelse: 'Sendt til NAV',
      datotid: formatDateTime(sendtTimestamp),
    },
    temaer: [
      getStartDato(søknad),
      getMedlemskap(søknad),
      getYrkesskade(søknad),
      getRegistrerteBehandlere(søknad),
      getAndreBehandlere(søknad),
      getBarn(søknad),
      getStudent(søknad),
      getAndreYtelser(søknad),
      getTilleggsopplysninger(søknad),
      getVedlegg(søknad, requiredVedlegg),
      getManglendeVedlegg(søknad, requiredVedlegg),
    ],
  };
};
