import { JaEllerNei } from 'types/Generic';
import { getAndreUtbetalingerSchema, StønadType } from './AndreUtbetalinger';

describe('AndreUtbetalinger validation', () => {
  const schema = getAndreUtbetalingerSchema(jest.fn());
  it('ingenting utfylt', async () => {
    const form = {
      andreUtbetalinger: {
        stønad: [],
      },
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
  it('lønn, ikke stønad', async () => {
    const form = {
      andreUtbetalinger: {
        lønn: JaEllerNei.JA,
        stønad: [],
      },
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
  it('stønad, ikke lønn', async () => {
    const form = {
      andreUtbetalinger: {
        stønad: [StønadType.INTRODUKSJONSSTØNAD],
      },
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
  it('stønad og lønn', async () => {
    const form = {
      andreUtbetalinger: {
        lønn: JaEllerNei.JA,
        stønad: [StønadType.INTRODUKSJONSSTØNAD],
      },
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
  it('AFP, må fylle ut fra hvem', async () => {
    const form = {
      andreUtbetalinger: {
        lønn: JaEllerNei.JA,
        stønad: [StønadType.AFP],
      },
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
  it('AFP fra posten', async () => {
    const form = {
      andreUtbetalinger: {
        lønn: JaEllerNei.JA,
        stønad: [StønadType.AFP],
        afp: {
          hvemBetaler: 'Posten AS',
        },
      },
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
});
