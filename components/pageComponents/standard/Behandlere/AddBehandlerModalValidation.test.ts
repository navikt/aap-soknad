import { JaEllerNei } from 'types/Generic';
import { getBehandlerSchema } from './AddBehandlerModal';

describe('AddBehandlerModal validation', () => {
  const schema = getBehandlerSchema(jest.fn());
  it('ingenting utfylt', async () => {
    const result = await schema.validate({}, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
  it('registrert behandler men fullt navn', async () => {
    const form = {
      firstname: 'chris',
      lastname: 'nordperson',
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
  it('registrert behandler, kun fornavn', async () => {
    const form = {
      firstname: 'chris',
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
  it('registrert behandler, kun etternavn', async () => {
    const form = {
      etternavn: 'chris',
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
});
