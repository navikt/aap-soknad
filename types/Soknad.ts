import { StønadType } from 'components/pageComponents/standard/AndreUtbetalinger/AndreUtbetalinger';
import { Relasjon } from 'components/pageComponents/standard/Barnetillegg/AddBarnModal';
import { JaEllerNei, JaNeiVetIkke } from './Generic';
import { JaNeiAvbrutt } from 'components/pageComponents/standard/Student/Student';
import { FerieType } from 'components/pageComponents/standard/StartDato/StartDato';
import { Vedlegg } from '@navikt/aap-felles-react';
import { Barn } from 'pages/api/oppslag/barn';
import { Fastlege } from 'pages/api/oppslag/fastlege';
import { OppslagBehandler } from 'context/sokerOppslagContext';

export type Navn = {
  fornavn?: string;
  mellomnavn?: string;
  etternavn?: string;
};
export type Periode = {
  fraDato?: Date;
  tilDato?: Date;
};

export type UtenlandsPeriode = {
  id?: string;
  land?: string;
  tilDato?: Date;
  fraDato?: Date;
  iArbeid?: JaEllerNei;
  utenlandsId?: string;
};

export type Medlemskap = {
  harBoddINorgeSiste5År?: JaEllerNei;
  harArbeidetINorgeSiste5År?: JaEllerNei;
  arbeidetUtenforNorgeFørSykdom?: JaEllerNei;
  iTilleggArbeidUtenforNorge?: JaEllerNei;
  utenlandsOpphold?: UtenlandsPeriode[];
};
export type Behandler = {
  firstname?: string;
  lastname?: string;
  gateadresse?: string;
  legekontor?: string;
  postnummer?: string;
  poststed?: string;
  telefon?: string;
  id?: string;
};
export interface RegistrertBehandler extends OppslagBehandler {
  erRegistrertFastlegeRiktig?: JaEllerNei;
}

export interface RegistrertFastlege extends Fastlege {
  erRegistrertFastlegeRiktig?: JaEllerNei;
}

type Student = {
  erStudent?: JaNeiAvbrutt;
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

export type ManuelleBarn = {
  navn: Navn;
  internId: string;
  fødseldato: Date;
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

// [key: string] brukes for å legge til dynamiske felter for manuelle barn
export interface SoknadVedlegg {
  [key: string]: Vedlegg[] | undefined;
  LØNN_OG_ANDRE_GODER?: Vedlegg[];
  OMSORGSSTØNAD?: Vedlegg[];
  UTLANDSSTØNAD?: Vedlegg[];
  SYKESTIPEND?: Vedlegg[];
  LÅN?: Vedlegg[];
  AVBRUTT_STUDIE?: Vedlegg[];
  ANNET?: Vedlegg[];
}

export interface Soknad {
  sykepenger?: JaEllerNei;
  yrkesskade?: JaEllerNei;
  medlemskap?: Medlemskap;
  /**
   * @Deprecated
   */
  registrerteBehandlere?: RegistrertBehandler[];
  fastlege?: RegistrertFastlege[];
  andreBehandlere?: Behandler[];
  student?: Student;
  andreUtbetalinger?: AndreUtbetalinger;
  barn?: Barn[];
  manuelleBarn?: ManuelleBarn[];
  tilleggsopplysninger?: string;
  ferie?: Ferie;
  vedlegg?: SoknadVedlegg;
  søknadBekreft?: boolean;
}
