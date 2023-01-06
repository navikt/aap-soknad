import { JaEllerNei } from 'types/Generic';
import { getBehandlerSchema } from './Behandlere';

describe('Behandlere validation', () => {
  const schema = getBehandlerSchema(jest.fn());
  const registrertBehandler = {
    type: 'FASTLEGE',
    navn: { fornavn: 'Lise', etternavn: 'Legesen' },
    kategori: 'LEGE',
    kontaktinformasjon: {
      behandlerRef: 'd182f24b-ebca-4f44-bf86-65901ec6141b',
      kontor: 'ASKØY KOMMUNE SAMFUNNSMEDISINSK AVD ALMENNLEGETJENESTEN',
      orgnummer: '976673867',
      adresse: {
        adressenavn: 'Kleppeveien',
        husnummer: '17',
        postnummer: {
          postnr: '5300',
          poststed: 'KLEPPESTØ',
        },
      },
      telefon: '99 99 99 99',
    },
  };
  it('ingenting registrerte behandlere', async () => {
    const form = {
      registrerteBehandlere: [],
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
  it('har registrert behandler, info er riktig', async () => {
    const form = {
      registrerteBehandlere: [
        {
          ...registrertBehandler,
          erRegistrertFastlegeRiktig: JaEllerNei.JA,
        },
      ],
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
  it('har registrert behandler, info er feil', async () => {
    const form = {
      registrerteBehandlere: [
        {
          ...registrertBehandler,
          erRegistrertFastlegeRiktig: JaEllerNei.NEI,
        },
      ],
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
  it('har registrert behandler, må svare om info er riktig', async () => {
    const form = {
      registrerteBehandlere: [
        {
          ...registrertBehandler,
        },
      ],
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
});
