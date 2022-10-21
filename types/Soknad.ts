import {
  AttachmentType,
  StønadType,
} from 'components/pageComponents/standard/AndreUtbetalinger/AndreUtbetalinger';
import { Relasjon } from 'components/pageComponents/standard/Barnetillegg/AddBarnModal';
import { JaEllerNei, JaNeiVetIkke } from './Generic';
import { AVBRUTT_STUDIE_VEDLEGG } from 'components/pageComponents/standard/Student/Student';
import { OppslagBehandler } from 'context/sokerOppslagContext';
import { BARN } from 'components/pageComponents/standard/Barnetillegg/Barnetillegg';

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
type Student = {
  erStudent?: JaEllerNei;
  kommeTilbake?: JaNeiVetIkke;
};
type AndreUtbetalinger = {
  lønn?: string;
  stønad?: Array<StønadType>;
  afp?: {
    hvemBetaler?: string;
  };
  utbetaling?: {
    utbetalingsType?: string;
    ferie?: {
      skalHaFerie?: string;
      type?: string;
      periode?: Periode;
    };
  };
};
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
  ferieType?: string;
  antallDager?: string;
  fraDato?: Date;
  tilDato?: Date;
};

export type Vedlegg = {
  name: string;
  size: string;
  vedleggId: string;
};

export type StartDato = Date;

export interface Soknad {
  startDato?: StartDato;
  hvorfor?: string;
  begrunnelse?: string;
  yrkesskade?: Yrkesskade;
  medlemskap?: Medlemskap;
  registrerteBehandlere?: RegistrertBehandler[];
  andreBehandlere?: Behandler[];
  student?: Student;
  andreUtbetalinger?: AndreUtbetalinger;
  [BARN]?: Barn[];
  manuelleBarn?: ManuelleBarn[];
  tilleggsopplysninger?: string;
  ferie?: Ferie;
  vedlegg?: {
    [AttachmentType.LØNN_OG_ANDRE_GODER]: Vedlegg[];
    [AttachmentType.OMSORGSSTØNAD]: Vedlegg[];
    [AttachmentType.UTLANDSSTØNAD]: Vedlegg[];
    [AttachmentType.SYKESTIPEND]: Vedlegg[];
    [AttachmentType.LÅN]: Vedlegg[];
    [AVBRUTT_STUDIE_VEDLEGG]: Vedlegg[];
    annet: Vedlegg[];
  };
  søknadBekreft?: boolean;
}
