FROM gcr.io/distroless/nodejs20-debian12@sha256:2f43265a4c0ab49005ddd6fe3ce65514bd1691e8e48a1b9b0411e49e079e1c80


WORKDIR /app
COPY .next/standalone ./
COPY .next/static ./.next/static

ENV NODE_ENV production

EXPOSE 3000

ENV PORT 3000

CMD ["server.js"]
