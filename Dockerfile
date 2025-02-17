FROM gcr.io/distroless/nodejs20-debian12@sha256:03d681b39b9251008fa2ba8de0f74cb4d909d4ef95f3f66090da29536c3b5cae


WORKDIR /app
COPY .next/standalone ./
COPY .next/static ./.next/static

ENV NODE_ENV production

EXPOSE 3000

ENV PORT 3000

CMD ["server.js"]
