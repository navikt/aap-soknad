import { JaEllerNei } from 'types/Generic';
import { migrerMellomlagretBehandler } from 'lib/utils/migrerMellomlagretBehandler';
import { SoknadContextState } from 'context/soknadcontext/soknadContext';

const mellomlagretSøknad: SoknadContextState = {
  version: 1,
  requiredVedlegg: [],
  søknad: {
    registrerteBehandlere: [
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
    ],
  },
};

const mellomlagretSøknadFraSøknadAPI: any = {
  søknad: {
    registrerteBehandlere: [
      {
        erRegistrertFastlegeRiktig: JaEllerNei.JA,
        type: 'FASTLEGE',
        navn: { fornavn: 'Sonja', mellomnavn: 'Paracet', etternavn: 'Plastersen' },
        kategori: 'LEGE',
        kontaktinformasjon: {
          behandlerRef: 'd182f24b-ebca-4f44-bf86-65901ec6141b',
          kontor: 'Andeby legekontor',
          orgnummer: '999999',
          adresse: {
            adressenavn: 'Skogveien',
            husnummer: '17',
            postnummer: {
              postnr: '1234',
              poststed: 'Andeby',
            },
          },
          telefon: '99999999',
        },
      },
    ],
  },
};

describe('migrer mellomlagret behandler', () => {
  describe('migrerer når', () => {
    test('behandler kommer fra gammel struktur og spørsmål om behandler er korrekt er besvart', () => {
      const res = migrerMellomlagretBehandler(mellomlagretSøknadFraSøknadAPI);
      expect(res.søknad?.registrerteBehandlere).toHaveLength(1);

      const migrertBehandler =
        res.søknad?.registrerteBehandlere && res.søknad.registrerteBehandlere[0];
      expect(migrertBehandler).not.toBeUndefined();

      // @ts-ignore - Typen sier den kan være undef, men den er ikke det her.
      const forventetBehandler = mellomlagretSøknad.søknad.registrerteBehandlere[0];
      expect(migrertBehandler).toEqual(forventetBehandler);
    });
  });

  describe('migrerer ikke når', () => {
    test('mellomlagret behandler kommer fra oppslag', () => {
      const res = migrerMellomlagretBehandler(mellomlagretSøknad);
      expect(res).toEqual(mellomlagretSøknad);
    });

    test('mellomlagret søknad ikke inneholder noen behandlere', () => {
      const mellomlagretSøknadUtenRegistrertBehandler: SoknadContextState = {
        version: 1,
        requiredVedlegg: [],
        søknad: {
          registrerteBehandlere: [],
        },
      };

      const res = migrerMellomlagretBehandler(mellomlagretSøknadUtenRegistrertBehandler);
      expect(res.søknad?.registrerteBehandlere).toEqual([]);
    });

    test('registerteBehandlere ikke finnes', () => {
      const mellomlagretSøknadUtenRegistrertBehandler: SoknadContextState = {
        version: 1,
        requiredVedlegg: [],
        søknad: {},
      };

      const res = migrerMellomlagretBehandler(mellomlagretSøknadUtenRegistrertBehandler);
      expect(res.søknad?.registrerteBehandlere).toEqual(undefined);
    });

    test('registrerteBehandlere er undefined', () => {
      const mellomlagretSøknadUtenRegistrertBehandler: SoknadContextState = {
        version: 1,
        requiredVedlegg: [],
        søknad: {
          registrerteBehandlere: undefined,
        },
      };

      const res = migrerMellomlagretBehandler(mellomlagretSøknadUtenRegistrertBehandler);
      expect(res.søknad?.registrerteBehandlere).toEqual(undefined);
    });

    test('behandler kommer fra soknad-api og spørsmål om behandler er korrekt ikke er besvart', () => {
      const fastlegeSpmIkkeBesvart: any = {
        søknad: {
          registrerteBehandlere: [
            {
              type: 'FASTLEGE',
              navn: { fornavn: 'Sonja', mellomnavn: 'Paracet', etternavn: 'Plastersen' },
              kategori: 'LEGE',
              kontaktinformasjon: {
                behandlerRef: 'd182f24b-ebca-4f44-bf86-65901ec6141b',
                kontor: 'Andeby legekontor',
                orgnummer: '999999',
                adresse: {
                  adressenavn: 'Skogveien',
                  husnummer: '17',
                  postnummer: {
                    postnr: '1234',
                    poststed: 'Andeby',
                  },
                },
                telefon: '99999999',
              },
            },
          ],
        },
      };
      const res = migrerMellomlagretBehandler(fastlegeSpmIkkeBesvart);
      expect(res).toEqual(fastlegeSpmIkkeBesvart);
    });
  });
});
