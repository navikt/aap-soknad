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
  land: FieldAndLabel<string>;
  tilDato: FieldAndLabel<Date>;
  fraDato: FieldAndLabel<Date>;
  iArbeid: FieldAndLabel<boolean>;
  utenlandsId?: FieldAndLabel<string>;
};
type Yrkesskade = FieldAndLabel<string>;
type Medlemskap = {
  harBoddINorgeSiste5År?: FieldAndLabel<JaEllerNei>;
  harArbeidetINorgeSiste5År?: FieldAndLabel<JaEllerNei>;
  arbeidetUtenforNorgeFørSykdom?: FieldAndLabel<JaEllerNei>;
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
  erStudent?: FieldAndLabel<JaEllerNei>;
};
type AndreUtbetalinger = {
  lønn?: FieldAndLabel<string>;
  stønad?: FieldAndLabel<Array<string>>;
  utbetaling?: {
    utbetalingsType?: FieldAndLabel<string>;
    ferie?: {
      skalHaFerie?: FieldAndLabel<string>;
      type?: FieldAndLabel<string>;
      periode?: Periode;
    };
  };
};
export type Barn = {
  navn: Navn;
  fødselsdato?: string;
  fnr: string;
  harInntekt?: FieldAndLabel<string>;
  manueltOpprettet?: boolean;
  adoptertEllerFosterBarn?: FieldAndLabel<string>;
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
  tilleggsopplysninger?: FieldAndLabel<string>;
  ferie?: Ferie;
  vedlegg?: {
    name: string;
    size: string;
    data: FormData;
  }[];
  søknadBekreft?: FieldAndLabel<boolean>;
}

export default Soknad;
