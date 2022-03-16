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

  rest.get('/aap/soknad-api/buckets/les/UTLAND', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.delay(100),
      ctx.json({
        version: 1,
        type: 'UTLAND',
        currentStep: 'DESTINATION',
        søknad: {
          country: 'AG',
          fromDate: '2022-02-04T11:00:00.000Z',
          toDate: '2022-02-18T11:00:00.000Z',
        },
        søkerinfo: 'test',
      })
    );
  }),

  rest.get('/aap/soknad-api/buckets/les/HOVED', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.delay(100),
      ctx.json({})
      // ctx.json({
      //   version: 1,
      //   type: 'HOVED',
      //   lagretCurrentStep: 'KONTAKTINFO',
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
  rest.delete('/aap/soknad-api/buckets/slett/HOVED', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ ok: true }), ctx.delay(3000));
    // return res(ctx.status(500), ctx.json({ ok: false }), ctx.delay(3000));
  }),
  rest.post('/aap/soknad-api/innsending/soknad', (req, res, ctx) => {
    return res(ctx.status(200), ctx.delay(1200), ctx.json({}));
  }),
  rest.get('/aap/soknad-api/oppslag/soeker', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.delay(100),
      ctx.json({
        søker: {
          navn: {
            fornavn: 'Fornavn',
            mellomnavn: 'Fra',
            etternavn: 'Oppslag',
          },
          fødseldato: '2022-02-14',
          barn: [
            {
              navn: {
                fornavn: 'Barn',
                mellomnavn: 'Nummer',
                etternavn: 'En',
              },
              fødseldato: '2022-02-14',
            },
            {
              navn: {
                fornavn: 'Barn',
                mellomnavn: 'Nummer',
                etternavn: 'To',
              },
              fødseldato: '2022-02-14',
            },
            {
              navn: {
                fornavn: 'Barn',
                mellomnavn: 'Nummer',
                etternavn: 'Tre',
              },
              fødseldato: '2022-02-14',
            },
            {
              navn: {
                fornavn: 'Barn',
                mellomnavn: 'Nummer',
                etternavn: 'Fire',
              },
              fødseldato: '2022-02-14',
            },
          ],
        },
        behandlere: [
          {
            type: 'FASTLEGE',
            navn: { fornavn: 'Nina Unni', etternavn: 'Borge' },
            kontaktinformasjon: {
              behandlerRef: 'd182f24b-ebca-4f44-bf86-65901ec6141b',
              kontor: 'ASKØY KOMMUNE SAMFUNNSMEDISINSK AVD ALMENNLEGETJENESTEN',
              orgnummer: '976673867',
              adresse: 'Kleppeveien 17',
              postnr: '5300',
              poststed: 'KLEPPESTØ',
              telefon: '56 15 83 10',
            },
          },
        ],
      })
    );
  }),
];
