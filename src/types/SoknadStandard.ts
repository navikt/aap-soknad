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
export type UtenlandsPeriode = {
  land: FieldAndLabel<string>;
  tilDato: FieldAndLabel<Date>;
  fraDato: FieldAndLabel<Date>;
  iArbeid: FieldAndLabel<boolean>;
};
type Yrkesskade = FieldAndLabel<string>;
type Medlemskap = {
  harBoddINorgeSiste5År?: FieldAndLabel<JaEllerNei>;
  harArbeidetINorgeSiste5År?: FieldAndLabel<JaEllerNei>;
  arbeidetUtenforNorgeFørSykdom?: FieldAndLabel<JaEllerNei>;
  utenlandsOpphold?: UtenlandsPeriode[];
};
export type Behandler = {
  name: string;
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
      periode?: {
        fraDato?: FieldAndLabel<string>;
        tilDato?: FieldAndLabel<string>;
      };
    };
  };
};
export type Barn = {
  navn: Navn;
  fødselsdato?: string;
  fnr: string;
  erForsørger?: FieldAndLabel<string>;
  manueltOpprettet?: boolean;
  adoptertEllerFosterBarn?: FieldAndLabel<string>;
};
interface SoknadStandard {
  bekreftOpplysninger?: JaEllerNei;
  yrkesskade?: Yrkesskade;
  medlemskap?: Medlemskap;
  behandlere?: Behandler[];
  student?: Student;
  andreUtbetalinger?: AndreUtbetalinger;
  barnetillegg?: Barn[];
  tilleggsopplysninger?: FieldAndLabel<string>;
  vedlegg?: {
    name: string;
    size: string;
    data: FormData;
  }[];
}

export default SoknadStandard;
