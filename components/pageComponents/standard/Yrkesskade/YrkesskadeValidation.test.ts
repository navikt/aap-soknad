import { JaEllerNei } from 'types/Generic';
import { getYrkesskadeSchema } from './Yrkesskade';
import { describe, it, expect, vi } from 'vitest';

describe('Yrkesskade validation', () => {
  const schema = getYrkesskadeSchema(vi.fn());
  it('ingenting utfylt', async () => {
    const result = await schema.validate({}, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
  it('har yrkesskade', async () => {
    const form = { yrkesskade: JaEllerNei.JA };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
  it('har ikke yrkesskade', async () => {
    const form = { yrkesskade: JaEllerNei.NEI };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
});
