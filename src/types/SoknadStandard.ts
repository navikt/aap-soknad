import { UtenlandsPeriode } from '../pages/standard/UtenlandsPeriodeVelger/UtenlandsPeriodeVelger';
import { JaEllerNei } from './Generic';
import { Behandler } from '../pages/standard/Behandlere';

interface SoknadStandard {
  bekreftOpplysninger?: JaEllerNei;
  harAnnenBehandler?: JaEllerNei;
  behandlere?: Behandler[];
  utenlandsOpphold?: UtenlandsPeriode[];
  utenlandsArbeid?: UtenlandsPeriode[];
  erStudent?: JaEllerNei;
  harBoddINorgeSiste5År?: JaEllerNei;
}

export default SoknadStandard;
