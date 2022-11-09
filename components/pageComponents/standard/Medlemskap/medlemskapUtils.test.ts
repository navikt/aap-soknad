import { JaEllerNei } from 'types/Generic';
import {
  shouldShowArbeidetSammenhengendeINorgeSiste5År,
  shouldShowArbeidetUtenforNorgeSiste5År,
  shouldShowITilleggArbeidetUtenforNorgeSiste5År,
} from './medlemskapUtils';

describe('medlemskapUtils', () => {
  it('skal vise Jobbet utenfor Norge dersom boddINorge == Ja', () => {
    expect(shouldShowArbeidetUtenforNorgeSiste5År(JaEllerNei.JA)).toBe(true);
  });
  it('skal ikke vise Jobbet utenfor Norge dersom boddINorge == Nei', () => {
    expect(shouldShowArbeidetUtenforNorgeSiste5År(JaEllerNei.NEI)).toBe(false);
  });
  it('skal vise Har jobbet sammenhengende dersom boddINorge == Nei', () => {
    expect(shouldShowArbeidetSammenhengendeINorgeSiste5År(JaEllerNei.NEI)).toBe(true);
  });
  it('skal ikke vise Har jobbet sammenhengende dersom boddINorge == Ja', () => {
    expect(shouldShowArbeidetSammenhengendeINorgeSiste5År(JaEllerNei.Ja)).toBe(false);
  });
  it('skal vise Har i tillegg jobbet utenfor Norge dersom harArbeidetINorgeSiste5år == Ja', () => {
    expect(shouldShowITilleggArbeidetUtenforNorgeSiste5År(JaEllerNei.JA)).toBe(true);
  });
  it('skal ikke vise Har i tillegg jobbet utenfor Norge dersom harArbeidetINorgeSiste5år == Ja', () => {
    expect(shouldShowITilleggArbeidetUtenforNorgeSiste5År(JaEllerNei.NEI)).toBe(false);
  });
});
