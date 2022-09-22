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
import { Soker } from 'context/sokerOppslagContext';
import { Soknad, Vedlegg } from 'types/Soknad';
import { BehandlerBackendState, SøknadBackendState } from 'types/SoknadBackendState';
import { formatDate } from './date';
import { formatNavn, getFullAdresse } from 'utils/StringFormatters';
import { BARN, GRUNNBELØP } from 'components/pageComponents/standard/Barnetillegg/Barnetillegg';
import { RequiredVedlegg } from 'types/SoknadContext';
import { Relasjon } from 'components/pageComponents/standard/Barnetillegg/AddBarnModal';
import {
  ARBEID_I_NORGE,
  BODD_I_NORGE,
  utenlandsPeriodeArbeidEllerBodd,
} from 'components/pageComponents/standard/Medlemskap/Medlemskap';

export type SøknadsType = 'UTLAND' | 'STANDARD';

export const GYLDIGE_SØKNADS_TYPER = ['UTLAND', 'STANDARD'];

export const erGyldigSøknadsType = (type?: string) =>
  typeof type === 'undefined' || !GYLDIGE_SØKNADS_TYPER.includes(type);

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

export const mapSøknadToBackend = (søknad?: Soknad): SøknadBackendState => {
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
            case StønadType.STIPEND:
              return {
                type: stønad,
                vedlegg:
                  søknad?.vedlegg?.[AttachmentType.SYKESTIPEND]?.map(
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
      søknad?.[BARN]?.map((barn) => ({
        merEnnIG: jaNeiToBoolean(barn.harInntekt),
      })) ?? [],
    andreBarn:
      søknad?.manuelleBarn?.map((barn) => ({
        barn: {
          fødseldato: formatDate(barn.fødseldato, 'yyyy-MM-dd'),
          navn: barn.navn,
        },
        relasjon: barn.relasjon,
        merEnnIG: jaNeiToBoolean(barn.harInntekt),
        vedlegg: barn?.vedlegg?.map((e) => e?.vedleggId),
      })) ?? [],
    ...(søknad?.vedlegg?.annet
      ? { vedlegg: søknad?.vedlegg?.annet?.map((e) => e?.vedleggId) }
      : {}),
  };
};

enum Types {
  FRITEKST = 'FRITEKST',
  FELT = 'FELT',
}
type Felt = {
  type: Types.FELT;
  felt?: string;
  verdi?: string;
};
type Fritekst = {
  type: Types.FRITEKST;
  tekst?: string;
  indent?: boolean;
};
const createField = (felt: string, verdi: string | undefined, skipIfFalsy = false) => {
  if (skipIfFalsy && !verdi) return [];
  const res: Felt = {
    type: Types.FELT,
    felt,
    verdi,
  };
  return [res];
};
const createFritekst = (tekst: string, skipIfFalsy = false, indent = false) => {
  if (skipIfFalsy && !tekst) return [];
  const fritekst: Fritekst = {
    type: Types.FRITEKST,
    tekst,
    ...(indent ? { indent: true } : {}),
  };
  return [fritekst];
};

const createGruppe = (overskrift: string, tabellrader: any[]) => ({
  type: 'GRUPPE',
  overskrift,
  tabellrader,
});
const createFeltgruppe = (felter: any[], overskrift?: string) => ({
  type: 'FELTGRUPPE',
  felter,
  overskrift,
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
  const getMedlemskap = (søknad?: Soknad) => {
    const utenlandsOpphold = søknad?.medlemskap?.utenlandsOpphold
      ? [
          createGruppe(
            formatMessage(
              `søknad.medlemskap.utenlandsperiode.modal.ingress.${utenlandsPeriodeArbeidEllerBodd(
                søknad?.medlemskap?.[ARBEID_I_NORGE],
                søknad?.medlemskap?.[BODD_I_NORGE]
              )}`
            ),
            søknad?.medlemskap?.utenlandsOpphold?.map((opphold) =>
              createFeltgruppe([
                ...createField('Land', opphold?.land),
                ...createField(
                  'Periode',
                  `Fra ${formatDate(opphold?.fraDato)} til ${formatDate(opphold?.tilDato)}`
                ),
                ...createField(
                  formatMessage('søknad.medlemskap.utenlandsperiode.modal.iArbeid.label'),
                  opphold?.iArbeid,
                  true
                ),
                ...createField(
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
        createFeltgruppe([
          ...createField('Type', behandler?.type),
          ...createField('Kategori', behandler?.kategori),
          ...createField('Navn', formatNavn(behandler?.navn)),
          ...createField('Kontor', behandler?.kontaktinformasjon?.kontor),
          ...createField('Adresse', getFullAdresse(behandler?.kontaktinformasjon?.adresse)),
          ...createField('Telefon', behandler?.kontaktinformasjon?.telefon),
          ...createField(
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
        createFeltgruppe([
          ...createField(
            'Navn',
            formatNavn({ fornavn: behandler?.firstname, etternavn: behandler?.lastname })
          ),
          ...createField('Kontor', behandler?.legekontor),
          ...createField(
            'Adresse',
            getFullAdresse({
              adressenavn: behandler?.gateadresse,
              postnummer: {
                postnr: behandler?.postnummer,
                poststed: behandler?.poststed,
              },
            })
          ),
          ...createField('Telefon', behandler?.telefon),
        ])
      ) || [];
    return createTema('Andre behandlere', andreBehandlere);
  };
  const getBarn = (søknad?: Soknad) => {
    const registrerteBarn =
      søknad?.[BARN]?.map((barn) =>
        createFeltgruppe([
          ...createField('Navn', formatNavn(barn?.navn)),
          ...createField('Fødselsdato', barn?.fødseldato || ''),
          ...createField(
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
        createFeltgruppe([
          ...createField('Navn', formatNavn(barn?.navn)),
          ...createField('Fødselsdato', barn?.fødseldato ? formatDate(barn.fødseldato) : ''),
          ...createField(
            formatMessage('søknad.barnetillegg.leggTilBarn.modal.relasjon.label'),
            barn?.relasjon
          ),
          ...createField(
            formatMessage(
              'søknad.barnetillegg.registrerteBarn.harInntekt.label',
              {
                grunnbeløp: GRUNNBELØP,
              },
              true
            ),
            barn?.harInntekt,
            true
          ),
        ])
      ) || [];
    return createTema('Barn', [...registrerteBarn, ...andreBarn]);
  };
  const getAndreYtelser = (søknad?: Soknad) => {
    const stønader =
      søknad?.andreUtbetalinger?.stønad?.reduce((acc: Fritekst[], stønadType: StønadType) => {
        const ekstra =
          stønadType === StønadType.AFP
            ? createFritekst(
                `Utbetaler: ${søknad?.andreUtbetalinger?.afp?.hvemBetaler}`,
                false,
                true
              )
            : [];
        return [
          ...acc,
          ...createFritekst(formatMessage(stønadTypeToAlternativNøkkel(stønadType))),
          ...ekstra,
        ];
      }, []) || [];
    return createTema('Andre ytelser', [
      ...createField(
        formatMessage('søknad.andreUtbetalinger.lønn.label'),
        formatMessage(`answerOptions.jaEllerNei.${søknad?.andreUtbetalinger?.lønn}`)
      ),
      createFeltgruppe(stønader, formatMessage('søknad.andreUtbetalinger.stønad.label')),
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
  const getVedlegg = (søknad?: Soknad, requiredVedlegg?: RequiredVedlegg[]) => {
    const opplastedeVedlegg = requiredVedlegg?.filter((vedlegg) => vedlegg?.completed) || [];
    const ordinæreVedlegg = opplastedeVedlegg
      ?.filter(
        (e) => e?.filterType !== Relasjon.FORELDER && e?.filterType !== Relasjon.FOSTERFORELDER
      )
      .map((vedlegg) => {
        const vedleggListe = søknad?.vedlegg?.[vedlegg?.type as AttachmentType]?.map(
          (file: Vedlegg) => file?.name
        );
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
    return createTema('Manglende vedlegg', [createListe('', manglendeVedlegg)]);
  };
  return {
    temaer: [
      getMedlemskap(søknad),
      getYrkesskade(søknad),
      getRegistrerteBehandlere(søknad),
      getAndreBehandlere(søknad),
      getBarn(søknad),
      getStudent(søknad),
      getAndreYtelser(søknad),
      getVedlegg(søknad, requiredVedlegg),
      getManglendeVedlegg(søknad, requiredVedlegg),
      createTema('Bekreftelse', [
        ...createFritekst(formatMessage('søknad.oppsummering.confirmation.text')),
      ]),
    ],
  };
};
