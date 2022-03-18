import { JaEllerNei } from './Generic';

export type FieldAndLabel<T> = {
  label: string;
  value: T;
};
type Navn = {
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
};
type Barn = {
  navn: Navn;
  fødselsdato?: string;
  fnr: string;
  erForsørger?: FieldAndLabel<string>;
  manueltOpprettet?: boolean;
  adoptertEllerFosterBarn?: string;
};
interface SoknadStandard {
  bekreftOpplysninger?: JaEllerNei;
  yrkesskade?: Yrkesskade;
  medlemskap?: Medlemskap;
  behandlere?: Behandler[];
  student?: Student;
  andreUtbetalinger?: AndreUtbetalinger;
  barnetillegg?: Barn[];
}

export default SoknadStandard;
