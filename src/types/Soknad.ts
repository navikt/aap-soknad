import { JaEllerNei } from './Generic';

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
  fraDato?: string;
  tilDato?: string;
};
export type UtenlandsPeriode = {
  land: string;
  tilDato: Date;
  fraDato: Date;
  iArbeid: boolean;
  utenlandsId?: string;
};
type Yrkesskade = string;
type Medlemskap = {
  harBoddINorgeSiste5År?: JaEllerNei;
  harArbeidetINorgeSiste5År?: JaEllerNei;
  arbeidetUtenforNorgeFørSykdom?: JaEllerNei;
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
};
type Student = {
  erStudent?: JaEllerNei;
};
type AndreUtbetalinger = {
  lønn?: string;
  stønad?: Array<string>;
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
  fødselsdato?: string;
  fnr: string;
  harInntekt?: string;
  manueltOpprettet?: boolean;
};
export type Ferie = {
  skalHaFerie?: string;
  type?: string;
  antallDager?: string;
  periode?: Periode;
};
export type StartDato = Date;

interface Soknad {
  startDato?: StartDato;
  yrkesskade?: Yrkesskade;
  medlemskap?: Medlemskap;
  behandlere?: Behandler[];
  student?: Student;
  andreUtbetalinger?: AndreUtbetalinger;
  barnetillegg?: Barn[];
  tilleggsopplysninger?: string;
  ferie?: Ferie;
  vedlegg?: {
    name: string;
    size: string;
    data: FormData;
  }[];
  søknadBekreft?: boolean;
}

export default Soknad;
