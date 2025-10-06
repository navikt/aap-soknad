FROM gcr.io/distroless/nodejs20-debian12@sha256:6e42486ac99e61180177b7a383a2cf0745a3f584fda62f597bf093d946ce3d7d

WORKDIR /app
COPY .next/standalone ./
COPY .next/static ./.next/static

ENV NODE_ENV=production

EXPOSE 3000

ENV PORT=3000

CMD ["server.js"]
