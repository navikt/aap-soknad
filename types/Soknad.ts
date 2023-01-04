import {
  AndreUtbetalingerFormFields,
  AttachmentType,
  StønadType,
} from 'components/pageComponents/standard/AndreUtbetalinger/AndreUtbetalinger';
import { Relasjon } from 'components/pageComponents/standard/Barnetillegg/AddBarnModal';
import { JaEllerNei, JaNeiVetIkke } from './Generic';
import {
  AVBRUTT_STUDIE_VEDLEGG,
  StudentFormFields,
} from 'components/pageComponents/standard/Student/Student';
import { OppslagBehandler } from 'context/sokerOppslagContext';
import { BARN } from 'components/pageComponents/standard/Barnetillegg/Barnetillegg';
import { FerieType, SYKEPENGER } from 'components/pageComponents/standard/StartDato/StartDato';

export type FieldAndLabel<T> = {
  label?: string;
  value?: T;
};
export type Navn = {
  fornavn: string;
  mellomnavn?: string;
  etternavn: string;
};
export type Periode = {
  fraDato?: Date;
  tilDato?: Date;
};
export type UtenlandsPeriode = {
  land: string;
  tilDato: Date;
  fraDato: Date;
  iArbeid: JaEllerNei;
  utenlandsId?: string;
};
type Yrkesskade = JaEllerNei;
export type Medlemskap = {
  harBoddINorgeSiste5År?: JaEllerNei;
  harArbeidetINorgeSiste5År?: JaEllerNei;
  arbeidetUtenforNorgeFørSykdom?: JaEllerNei;
  iTilleggArbeidUtenforNorge?: JaEllerNei;
  utenlandsOpphold?: UtenlandsPeriode[];
};
export type Behandler = {
  firstname: string;
  lastname: string;
  gateadresse: string;
  legekontor: string;
  postnummer: string;
  poststed: string;
  telefon: string;
  id: string;
};
export interface RegistrertBehandler extends OppslagBehandler {
  erRegistrertFastlegeRiktig?: JaEllerNei;
}
export type Barn = {
  navn: Navn;
  fødseldato?: string;
  fnr: string;
  harInntekt?: string;
  manueltOpprettet?: boolean;
  relasjon?: 'FORELDER' | 'FOSTERFORELDER';
};

export type ManuelleBarn = {
  navn: Navn;
  internId: string;
  fødseldato?: Date;
  harInntekt?: string;
  relasjon: Relasjon;
  vedlegg?: Vedlegg[];
};

export type Ferie = {
  skalHaFerie?: string;
  ferieType?: FerieType;
  antallDager?: string;
  fraDato?: Date;
  tilDato?: Date;
};

export type Vedlegg = {
  name: string;
  size: string;
  vedleggId: string;
};
export type SoknadVedlegg = {
  [AttachmentType.LØNN_OG_ANDRE_GODER]: Vedlegg[];
  [AttachmentType.OMSORGSSTØNAD]: Vedlegg[];
  [AttachmentType.UTLANDSSTØNAD]: Vedlegg[];
  [AttachmentType.SYKESTIPEND]: Vedlegg[];
  [AttachmentType.LÅN]: Vedlegg[];
  [AVBRUTT_STUDIE_VEDLEGG]: Vedlegg[];
  annet: Vedlegg[];
};

export interface Soknad {
  [SYKEPENGER]?: JaEllerNei;
  ferie?: Ferie;
  yrkesskade?: Yrkesskade;
  medlemskap?: Medlemskap;
  registrerteBehandlere?: RegistrertBehandler[];
  andreBehandlere?: Behandler[];
  student?: StudentFormFields;
  andreUtbetalinger?: AndreUtbetalingerFormFields;
  [BARN]?: Barn[];
  manuelleBarn?: ManuelleBarn[];
  tilleggsopplysninger?: string;
  vedlegg?: SoknadVedlegg;
  søknadBekreft?: boolean;
}
