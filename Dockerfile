FROM gcr.io/distroless/nodejs20-debian12@sha256:f912a7599e5338df6527a669def29bddc9469fdac9ab22c4cc9282c1b64c868b


WORKDIR /app
COPY .next/standalone ./
COPY .next/static ./.next/static

ENV NODE_ENV production

EXPOSE 3000

ENV PORT 3000

CMD ["server.js"]
