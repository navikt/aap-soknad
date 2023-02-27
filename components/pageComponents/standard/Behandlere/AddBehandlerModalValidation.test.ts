import { JaEllerNei } from 'types/Generic';
import { getBehandlerSchema } from './AddBehandlerModal';

describe('should be invalid with empty object', () => {
  const schema = getBehandlerSchema(jest.fn());
  it('ingenting utfylt', async () => {
    const result = await schema.validate({}, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
  it('should be valid with only fullt navn', async () => {
    const form = {
      firstname: 'chris',
      lastname: 'nordperson',
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
  it('should be invalid with only fornavn', async () => {
    const form = {
      firstname: 'chris',
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
  it('should be invalid with only etternavn', async () => {
    const form = {
      etternavn: 'chris',
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
});
