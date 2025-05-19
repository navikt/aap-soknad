FROM gcr.io/distroless/nodejs20-debian12@sha256:643437d5798d82253774d484d21ca75f5a64160061993f8171153f80bdea9f2e


WORKDIR /app
COPY .next/standalone ./
COPY .next/static ./.next/static

ENV NODE_ENV production

EXPOSE 3000

ENV PORT 3000

CMD ["server.js"]
