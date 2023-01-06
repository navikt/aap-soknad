import { sub } from 'date-fns';
import { JaEllerNei } from 'types/Generic';
import { formatDate } from 'utils/date';
import { getBarnetillegSchema } from './Barnetillegg';

describe('Barnetillegg validation', () => {
  const schema = getBarnetillegSchema(jest.fn());
  const barn1 = {
    navn: {
      fornavn: 'Embla',
      mellomnavn: 'Bakke',
      etternavn: 'Li',
    },
    fødseldato: formatDate(sub(new Date(), { years: 1 }), 'yyyy-MM-dd'),
  };
  const barn2 = {
    navn: {
      fornavn: 'Jonas',
      mellomnavn: 'Li',
    },
    fødseldato: formatDate(sub(new Date(), { years: 2 }), 'yyyy-MM-dd'),
  };
  it('ingenting registrerte barn', async () => {
    const result = await schema.validate({}, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual({});
  });
  it('har registrerte barn, må svare på inntekt', async () => {
    const form = {
      barn: [barn1, barn2],
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
  it('har registrerte barn, inntekt JA', async () => {
    const form = {
      barn: [
        {
          ...barn1,
          harInntekt: JaEllerNei.JA,
        },
        {
          ...barn2,
          harInntekt: JaEllerNei.JA,
        },
      ],
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
  it('har registrerte barn, inntekt NEI', async () => {
    const form = {
      barn: [
        {
          ...barn1,
          harInntekt: JaEllerNei.NEI,
        },
        {
          ...barn2,
          harInntekt: JaEllerNei.NEI,
        },
      ],
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
});
