FROM gcr.io/distroless/nodejs20-debian12@sha256:05c79ce75a5807df4b3dd73467135e153f51ce1ecafd2284d3a06434cc0fd025


WORKDIR /app
COPY .next/standalone ./
COPY .next/static ./.next/static

ENV NODE_ENV production

EXPOSE 3000

ENV PORT 3000

CMD ["server.js"]
