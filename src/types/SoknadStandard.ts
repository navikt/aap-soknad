import { UtenlandsPeriode } from '../pages/standard/UtenlandsPeriodeVelger/UtenlandsPeriodeVelger';
import { JaEllerNei } from './Generic';

type FieldAndLabel<T> = {
  label: string;
  value: T;
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
interface SoknadStandard {
  bekreftOpplysninger?: JaEllerNei;
  yrkesskade?: Yrkesskade;
  medlemskap?: Medlemskap;
  behandlere?: Behandler[];
  student?: Student;
  andreUtbetalinger?: AndreUtbetalinger;
}

export default SoknadStandard;
