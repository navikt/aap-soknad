
import { rest } from 'msw';

export const handlers = [
  rest.get("/aap/soknad-api/me", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        name: "Ola Nordmann"
      })
    )
  }),

  rest.post("/aap/soknad-api/innsending/utland", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({id: 12345}),
      ctx.delay(3000)
    )
  }),

  rest.post("/aap/soknad-api/buckets/lagre/UTLAND", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.delay(100),
      ctx.json({})
    )
  }),

  rest.get("/aap/soknad-api/buckets/les/UTLAND", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.delay(100),
      ctx.json({})
    )
  }),

  rest.post("/aap/soknad-api/innsending/soknad", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.delay(1200),
      ctx.json({})
    )
  })
];
