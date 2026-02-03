import { JaEllerNei } from 'types/Generic';
import { getAndreUtbetalingerSchema, StønadType } from './AndreUtbetalinger';
import { describe, vi, it, expect } from 'vitest';

describe('AndreUtbetalinger validation', () => {
  const schema = getAndreUtbetalingerSchema(vi.fn());
  it('ingenting utfylt', async () => {
    const form = {
      stønad: [],
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
  it('lønn, ikke stønad', async () => {
    const form = {
      lønn: JaEllerNei.JA,
      stønad: [],
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
  it('stønad, ikke lønn', async () => {
    const form = {
      stønad: [StønadType.INTRODUKSJONSSTØNAD],
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
  it('stønad og lønn', async () => {
    const form = {
      lønn: JaEllerNei.JA,
      stønad: [StønadType.INTRODUKSJONSSTØNAD],
      afp: {},
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
  it('AFP, må fylle ut fra hvem', async () => {
    const form = {
      lønn: JaEllerNei.JA,
      stønad: [StønadType.AFP],
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
  it('AFP fra posten', async () => {
    const form = {
      lønn: JaEllerNei.JA,
      stønad: [StønadType.AFP],
      afp: {
        hvemBetaler: 'Posten AS',
      },
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
});
