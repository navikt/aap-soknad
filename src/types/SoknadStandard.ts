import { UtenlandsPeriode } from '../pages/standard/UtenlandsPeriodeVelger/UtenlandsPeriodeVelger';
import { JaEllerNei } from './Generic';
import { Behandler } from '../pages/standard/Behandlere';

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
interface SoknadStandard {
  bekreftOpplysninger?: JaEllerNei;
  yrkesskade?: Yrkesskade;
  medlemskap?: Medlemskap;
  harAnnenBehandler?: JaEllerNei;
  behandlere?: Behandler[];
  erStudent?: JaEllerNei;
}

export default SoknadStandard;
