import { getStartDatoSchema } from './StartDato';

describe('Start dato validation', () => {
  const schema = getStartDatoSchema(jest.fn());
  it('should return invalid for empty object', async () => {
    const result = await schema.validate({}, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });

  it('should validate startDato correctly', async () => {
    const form = {
      ferie: {
        skalHaFerie: 'Ja',
        ferieType: 'Nei, men jeg vet antall feriedager',
        antallDager: '2',
      },
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });

  it("should be invalid if 'skalHaFerie' is 'Ja' but 'ferieType' is undefined", async () => {
    const form = {
      ferie: {
        skalhaFerie: 'Ja',
      },
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).toBe(1);
  });

  it("should be invalid if 'fraDato' or 'tilDato' is not set when 'ferieType' is 'Ja'", async () => {
    const form = {
      ferie: {
        skalHaFerie: 'Ja',
        ferieType: 'Ja',
      },
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).toBe(2);
  });

  it("should be invalid when 'fraDato' is more recent than 'toDato'", async () => {
    const form = {
      ferie: {
        skalHaFerie: 'Ja',
        ferieType: 'Ja',
        fraDato: '2020-01-01',
        tilDato: '2019-01-01',
      },
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).toBe(1);
  });
});
