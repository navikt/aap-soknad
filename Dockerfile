FROM gcr.io/distroless/nodejs20-debian12@sha256:6848ce991f65e2ee8641b9c75d8d38b25d3bc45014b5dd6b31b736d152c8a0f8


WORKDIR /app
COPY .next/standalone ./
COPY .next/static ./.next/static

ENV NODE_ENV production

EXPOSE 3000

ENV PORT 3000

CMD ["server.js"]
