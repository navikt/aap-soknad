import { rest } from 'msw';

export const handlers = [
  rest.post('/aap/client-logger/error', (req, res, ctx) => {
    return res(ctx.status(200), ctx.delay(1000));
  }),
  rest.get('/aap/soknad-api/me', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        name: 'Ola Nordmann',
      })
    );
  }),

  rest.post('/aap/soknad-api/innsending/utland', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ id: 12345 }), ctx.delay(3000));
  }),

  rest.post('/aap/soknad-api/buckets/lagre/UTLAND', (req, res, ctx) => {
    return res(ctx.status(200), ctx.delay(100), ctx.json({}));
  }),
  rest.post('/aap/soknad-api/buckets/lagre/STANDARD', (req, res, ctx) => {
    return res(ctx.status(200), ctx.delay(100), ctx.json({}));
  }),

  rest.get('/aap/soknad-api/buckets/les/UTLAND', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.delay(2000),
      ctx.json({})
      // ctx.json({
      //   version: 1,
      //   type: 'UTLAND',
      //   søknad: {
      //     country: 'AG',
      //     // fromDate: '2022-02-04T11:00:00.000Z',
      //     // toDate: '2022-02-18T11:00:00.000Z',
      //   },
      //   lagretStepList: [
      //     {
      //       name: 'DESTINATION',
      //       completed: true,
      //     },
      //     {
      //       name: 'TRAVEL_PERIOD',
      //       active: true,
      //     },
      //     {
      //       name: 'SUMMARY',
      //     },
      //     {
      //       name: 'RECEIPT',
      //     },
      //   ],
      //   søkerinfo: 'test',
      // })
    );
  }),
  rest.delete('/aap/soknad-api/buckets/slett/UTLAND', (req, res, ctx) => {
    return res(ctx.status(200), ctx.delay(3000));
    // return res(ctx.status(500), ctx.json({ ok: false }), ctx.delay(3000));
  }),

  rest.get('/aap/soknad-api/buckets/les/STANDARD', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.delay(100),
      ctx.json({})
      // ctx.json({
      //   version: 1,
      //   type: 'HOVED',
      //   søknad: {
      //     firstname: 'Tor',
      //     lastname: 'Idland',
      //     adresse: 'Veiveien 245',
      //     postnummer: '0472',
      //     poststed: 'Oslo',
      //     epost: 'tor@tor.no',
      //     telefon: '98809693',
      //   },
      //   lagretStepList: [
      //     {
      //       name: 'VEILEDNING',
      //       completed: true,
      //     },
      //     {
      //       name: 'KONTAKTINFO',
      //       active: true,
      //     },
      //     {
      //       name: 'FASTLEGE',
      //       label: 'Fastlege',
      //     },
      //     {
      //       name: 'TILKNYTNING_TIL_NORGE',
      //       label: 'Tilknytning til Norge',
      //     },
      //     {
      //       name: 'YRKESSKADE',
      //       label: 'Yrkesskade',
      //     },
      //     {
      //       name: 'ANDRE_UTBETALINGER',
      //       label: 'Andre utbetalinger',
      //     },
      //     {
      //       name: 'BARNETILLEGG',
      //       label: 'Barnetilleggg',
      //       completed: false,
      //     },
      //   ],
      // })
    );
  }),
  rest.delete('/aap/soknad-api/buckets/slett/STANDARD', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ ok: true }), ctx.delay(3000));
    // return res(ctx.status(500), ctx.json({ ok: false }), ctx.delay(3000));
  }),
  rest.post('/aap/soknad-api/innsending/soknad', (req, res, ctx) => {
    return res(ctx.status(200), ctx.delay(1200), ctx.json({}));
  }),
  rest.post('/aap/soknad-api/innsending/soknad', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ id: 12345, ok: true }), ctx.delay(3000));
  }),
  rest.get('/aap/soknad-api/oppslag/soeker', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.delay(500),
      ctx.json({
        søker: {
          navn: {
            fornavn: 'Anne',
            mellomnavn: '',
            etternavn: 'Olsen',
          },
          fødselsnummer: '10029099999',
          adresse: {
            adressenavn: 'Tulleveien',
            husbokstav: 'A',
            husnummer: '239',
            postnummer: {
              postnr: '0472',
              poststed: 'Oslo',
            },
          },
          fødseldato: '2022-02-14',
          barn: [
            {
              fnr: '456',
              navn: {
                fornavn: 'Emma',
                etternavn: 'Olsen',
              },
              fødseldato: '2022-02-14',
            },
            {
              fnr: '789',
              navn: {
                fornavn: 'Eira',
                etternavn: 'Olsen',
              },
              fødseldato: '2022-02-14',
            },
            {
              fnr: '012',
              navn: {
                fornavn: 'Tobias',
                etternavn: 'Olsen',
              },
              fødseldato: '2022-02-14',
            },
          ],
        },
        behandlere: [
          {
            type: 'FASTLEGE',
            navn: { fornavn: 'Inger', etternavn: 'Johansen' },
            kontaktinformasjon: {
              behandlerRef: 'd182f24b-ebca-4f44-bf86-65901ec6141b',
              kontor: 'Askøy kommune samfunnsmedisinsk avd almennlegetjenesten',
              orgnummer: '976673867',
              adresse: {
                adressenavn: 'Kleppeveien',
                husnummer: '17',
                postnummer: {
                  postnr: '5300',
                  poststed: 'Kleppestø',
                },
              },
              telefon: '56 15 83 10',
            },
          },
        ],
        kontaktinformasjon: {
          målform: 'NB',
          reservert: true,
          kanVarsles: true,
          epost: 'navn@epost.no',
          mobil: '99999999',
        },
      })
    );
  }),
  rest.post('/aap/soknad-api/vedlegg/lagre', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json('1234-unikid-5678'), ctx.delay(3000));
    // return res(ctx.status(415), ctx.delay(1000));
  }),
];
