FROM gcr.io/distroless/nodejs20-debian12@sha256:12edf70828313a57d869cc1e26f7ca0291b3b69b7bd0a39de0399d4cf69809a3

WORKDIR /app
COPY .next/standalone ./
COPY .next/static ./.next/static

ENV NODE_ENV=production

EXPOSE 3000

ENV PORT=3000

CMD ["server.js"]
