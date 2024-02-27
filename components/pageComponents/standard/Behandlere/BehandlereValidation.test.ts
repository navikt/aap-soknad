import { JaEllerNei } from 'types/Generic';
import { getBehandlerSchema } from './Behandlere';
import { Fastlege } from 'pages/api/oppslag/fastlege';

describe('Behandlere validation', () => {
  const schema = getBehandlerSchema(jest.fn());
  const fastlege: Fastlege = {
    navn: 'Lise Legesen',
    behandlerRef: 'd182f24b-ebca-4f44-bf86-65901ec6141b',
    kontaktinformasjon: {
      kontor: 'ASKØY KOMMUNE SAMFUNNSMEDISINSK AVD ALMENNLEGETJENESTEN',
      adresse: 'Kleppeveien 17, 5300 KLEPPESTØ',
      telefon: '99 99 99 99',
    },
  };
  it('ingenting registrerte behandlere', async () => {
    const form = {
      fastlege: [],
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
  it('har registrert behandler, info er riktig', async () => {
    const form = {
      fastlege: [
        {
          ...fastlege,
          erRegistrertFastlegeRiktig: JaEllerNei.JA,
        },
      ],
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
  it('har registrert behandler, info er feil', async () => {
    const form = {
      fastlege: [
        {
          ...fastlege,
          erRegistrertFastlegeRiktig: JaEllerNei.NEI,
        },
      ],
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
  it('har registrert behandler, må svare om info er riktig', async () => {
    const form = {
      fastlege: [
        {
          ...fastlege,
        },
      ],
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
});
