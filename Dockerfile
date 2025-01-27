FROM gcr.io/distroless/nodejs20-debian12@sha256:ca63fa0ef17943773736ae933e1a65a47c6eaddcfbcef600f136df707f4bbc86


WORKDIR /app
COPY .next/standalone ./
COPY .next/static ./.next/static

ENV NODE_ENV production

EXPOSE 3000

ENV PORT 3000

CMD ["server.js"]
