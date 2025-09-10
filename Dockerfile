FROM gcr.io/distroless/nodejs20-debian12@sha256:adce8f03e2b82454f0e36843879529ad8d2d1e6cc43ce26ff6124f04ab84a6cd

WORKDIR /app
COPY .next/standalone ./
COPY .next/static ./.next/static

ENV NODE_ENV=production

EXPOSE 3000

ENV PORT=3000

CMD ["server.js"]
