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
      fnr: '01020312345',
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
      fnr: '01020312345',
    };
    const result = await schema.validate(barn, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).toBe(1);
  });

  it('should validate missing fnr', async () => {
    const barn = {
      navn: {
        fornavn: 'Fornavn',
        etternavn: 'Etternavn',
      },
      fødseldato: sub(new Date(), { years: 1 }),
      relasjon: Relasjon.FORELDER,
      fnr: undefined,
    };
    const result = await schema.validate(barn, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should allow missing fnr if ukjentFnr is true', async () => {
    const barn = {
      navn: {
        fornavn: 'Fornavn',
        etternavn: 'Etternavn',
      },
      fødseldato: sub(new Date(), { years: 1 }),
      relasjon: Relasjon.FORELDER,
      fnr: undefined,
      ukjentFnr: true
    };
    const result = await schema.validate(barn, { abortEarly: false }).catch((err) => err);
    expect(result).toEqual(barn);
  });
});
