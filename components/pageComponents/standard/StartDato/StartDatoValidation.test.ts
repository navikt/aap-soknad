import { add } from 'date-fns';
import { JaEllerNei } from 'types/Generic';
import { FerieType, getStartDatoSchema } from './StartDato';
import { describe, expect, it, vi } from 'vitest';

describe('StartDato validation', () => {
  const schema = getStartDatoSchema(vi.fn());
  it('ingenting utfylt', async () => {
    const result = await schema.validate({}, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
  it('kommer ikke fra sykepenger', async () => {
    const form = { sykepenger: JaEllerNei.NEI, ferie: {} };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
  it('kommer fra sykepenger, må fylle ut mer', async () => {
    const form = { sykepenger: JaEllerNei.JA };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
  it('kommer fra sykepenger, men skal ikke ha ferie', async () => {
    const form = { sykepenger: JaEllerNei.JA, ferie: { skalHaFerie: JaEllerNei.NEI } };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
  it('kommer fra sykepenger og skal ha ferie, må fylle ut mer', async () => {
    const form = { sykepenger: JaEllerNei.JA, ferie: { skalHaFerie: JaEllerNei.JA } };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
  it('kommer fra sykepenger og vet feriedatoer', async () => {
    const form = {
      sykepenger: JaEllerNei.JA,
      ferie: {
        skalHaFerie: JaEllerNei.JA,
        ferieType: FerieType.PERIODE,
        fraDato: new Date(),
        tilDato: add(new Date(), { months: 5 }),
      },
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
  it('kommer fra sykepenger og vet feriedatoer, må fylle ut mer', async () => {
    const form = {
      sykepenger: JaEllerNei.JA,
      ferie: {
        skalHaFerie: JaEllerNei.JA,
        ferieType: FerieType.PERIODE,
      },
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
  it('kommer fra sykepenger og vet feriedatoer, ugyldig periode', async () => {
    const form = {
      sykepenger: JaEllerNei.JA,
      ferie: {
        skalHaFerie: JaEllerNei.JA,
        ferieType: FerieType.PERIODE,
        fraDato: add(new Date(), { months: 10 }),
        tilDato: add(new Date(), { months: 5 }),
      },
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
  it('kommer fra sykepenger og vet antall feriedager', async () => {
    const form = {
      sykepenger: JaEllerNei.JA,
      ferie: {
        skalHaFerie: JaEllerNei.JA,
        ferieType: FerieType.DAGER,
        antallDager: '10',
      },
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
  it('kommer fra sykepenger og vet antall feriedager, må fylle ut mer', async () => {
    const form = {
      sykepenger: JaEllerNei.JA,
      ferie: {
        skalHaFerie: JaEllerNei.JA,
        ferieType: FerieType.DAGER,
      },
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
});
