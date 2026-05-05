import { JaEllerNei } from 'types/Generic';
import { migrerMellomlagretBehandler } from 'lib/utils/migrerMellomlagretBehandler';
import { SoknadContextState } from 'context/soknadcontext/soknadContext';
import { describe, test, expect } from 'vitest';

const mellomlagretSøknadMedFastlegeObjekt: SoknadContextState = {
  version: 1,
  requiredVedlegg: [],
  søknad: {
    fastlege: {
      navn: 'Sonja Paracet Plastersen',
      erRegistrertFastlegeRiktig: JaEllerNei.JA,
      behandlerRef: 'd182f24b-ebca-4f44-bf86-65901ec6141b',
      kontaktinformasjon: {
        adresse: 'Skogveien 17, 1234 Andeby',
        kontor: 'Andeby legekontor',
        telefon: '99999999',
      },
    },
  },
};

describe('migrer mellomlagret fastlege', () => {
  describe('migrerer når', () => {
    test('mellomlagret fastlege som liste normaliseres til objekt', () => {
      const mellomlagretMedFastlegeListe: SoknadContextState = {
        version: 1,
        requiredVedlegg: [],
        søknad: {
          fastlege: [
            {
              navn: 'Sonja Paracet Plastersen',
              erRegistrertFastlegeRiktig: JaEllerNei.JA,
              behandlerRef: 'd182f24b-ebca-4f44-bf86-65901ec6141b',
              kontaktinformasjon: {
                adresse: 'Skogveien 17, 1234 Andeby',
                kontor: 'Andeby legekontor',
                telefon: '99999999',
              },
            },
          ] as any,
        },
      };

      const res = migrerMellomlagretBehandler(mellomlagretMedFastlegeListe);
      expect(Array.isArray(res.søknad?.fastlege)).toBe(false);
      expect(res.søknad?.fastlege).toEqual(mellomlagretSøknadMedFastlegeObjekt.søknad?.fastlege);
    });

    test('tom fastlegeliste normaliseres til null', () => {
      const mellomlagretMedTomFastlegeListe: SoknadContextState = {
        version: 1,
        requiredVedlegg: [],
        søknad: {
          fastlege: [] as any,
        },
      };

      const res = migrerMellomlagretBehandler(mellomlagretMedTomFastlegeListe);
      expect(res.søknad?.fastlege).toBeNull();
    });
  });

  describe('migrerer ikke når', () => {
    test('mellomlagret fastlege allerede er objekt', () => {
      const res = migrerMellomlagretBehandler(mellomlagretSøknadMedFastlegeObjekt);
      expect(res).toEqual(mellomlagretSøknadMedFastlegeObjekt);
    });

    test('søknad mangler fastlege', () => {
      const mellomlagretSøknadUtenFastlege: SoknadContextState = {
        version: 1,
        requiredVedlegg: [],
        søknad: {},
      };

      const res = migrerMellomlagretBehandler(mellomlagretSøknadUtenFastlege);
      expect(res).toEqual(mellomlagretSøknadUtenFastlege);
    });

    test('søknad er undefined', () => {
      const mellomlagretSøknadUtenSøknad: SoknadContextState = {
        version: 1,
        requiredVedlegg: [],
        søknad: undefined,
      };

      const res = migrerMellomlagretBehandler(mellomlagretSøknadUtenSøknad);
      expect(res).toEqual(mellomlagretSøknadUtenSøknad);
    });
  });
});
