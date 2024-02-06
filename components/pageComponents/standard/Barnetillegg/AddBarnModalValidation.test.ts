import { add, sub } from 'date-fns';
import { getAddBarnSchema, Relasjon } from './AddBarnModal';

describe('AddBarnModal validation', () => {
  const schema = getAddBarnSchema(jest.fn());
  it('should return invalid for empty object', async () => {
    const result = await schema.validate({}, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });

  it('should validate barnetillegg correctly', async () => {
    const barn = {
      navn: {
        fornavn: 'Fornavn',
        etternavn: 'Etternavn',
      },
      fødseldato: sub(new Date(), { years: 1 }),
      relasjon: Relasjon.FORELDER,
    };
    const result = await schema.validate(barn, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(barn);
  });

  it("should not be valid if 'fødselsdato' is in the future", async () => {
    const barn = {
      navn: {
        fornavn: 'Fornavn',
        etternavn: 'Etternavn',
      },
      fødseldato: add(new Date(), { years: 1 }),
      relasjon: Relasjon.FORELDER,
    };
    const result = await schema.validate(barn, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).toBe(1);
  });
});
