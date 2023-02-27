import { JaEllerNei } from 'types/Generic';
import { getBehandlerSchema } from './AddBehandlerModal';

describe('AddBehandlerModal validation', () => {
  const schema = getBehandlerSchema(jest.fn());
  it('ingenting utfylt', async () => {
    const result = await schema.validate({}, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
});
