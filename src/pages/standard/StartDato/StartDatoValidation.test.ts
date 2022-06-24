import { getSchema } from './StartDato';

describe('Start dato validation', () => {
  it('should return invalid for empty object', async () => {
    const schema = getSchema(jest.fn());
    const result = await schema.validate({}, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });

  it('should validate startDato correctly', async () => {
    const form = {
      startDato: new Date(),
      ferie: {
        skalHaFerie: 'Ja',
        ferieType: 'Nei, men jeg vet antall feriedager',
        antallDager: '2',
      },
    };
    const schema = getSchema(jest.fn());
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });

  it('should return invalid if ferie is missing when startDato is current day', async () => {
    const form = {
      startDato: new Date(),
    };
    const schema = getSchema(jest.fn());
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
});
