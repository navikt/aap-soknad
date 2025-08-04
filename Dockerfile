FROM gcr.io/distroless/nodejs20-debian12@sha256:ae2408f9d8fe3e9c2f07af5d70c61cd66ad679ed4ff061eab65d6136d1741198

WORKDIR /app
COPY .next/standalone ./
COPY .next/static ./.next/static

ENV NODE_ENV=production

EXPOSE 3000

ENV PORT=3000

CMD ["server.js"]
