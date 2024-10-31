FROM gcr.io/distroless/nodejs20-debian12@sha256:9f43117c3e33c3ed49d689e51287a246edef3af0afed51a54dc0a9095b2b3ef9


WORKDIR /app
COPY .next/standalone ./
COPY .next/static ./.next/static

ENV NODE_ENV production

EXPOSE 3000

ENV PORT 3000

CMD ["server.js"]
