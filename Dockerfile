FROM gcr.io/distroless/nodejs20-debian12@sha256:989e64eefe820612d302e33ef79d2209798fc67535112e660b446f564d82c0bd


WORKDIR /app
COPY .next/standalone ./
COPY .next/static ./.next/static

ENV NODE_ENV production

EXPOSE 3000

ENV PORT 3000

CMD ["server.js"]
