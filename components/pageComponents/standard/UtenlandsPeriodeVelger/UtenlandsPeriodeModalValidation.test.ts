import { getUtenlandsPeriodeSchema } from './UtenlandsPeriodeVelger';
import { JaEllerNei } from '../../../../types/Generic';

describe('UtenlandsPeriodaModal Validation', () => {
  const schema = getUtenlandsPeriodeSchema(jest.fn());
  it('should return invalid for empty object', async () => {
    const result = await schema.validate({}, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
  it('should return invalid if fraDato > tilDato', async () => {
    const form = {
      iArbeid: JaEllerNei.NEI,
      fraDato: '2021-01-01',
      tilDato: '2020-01-01',
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
  it('should return valid if fraDato < tilDato', async () => {
    const form = {
      iArbeid: JaEllerNei.JA,
      fraDato: '2020-01-01',
      tilDato: '2021-01-01',
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
});
