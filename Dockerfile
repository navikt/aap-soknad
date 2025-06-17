FROM gcr.io/distroless/nodejs20-debian12@sha256:7a9dc35e49140e0d23e3c4e4855438d6ec66b1fdc106be451f52dfb982f39cac


WORKDIR /app
COPY .next/standalone ./
COPY .next/static ./.next/static

ENV NODE_ENV production

EXPOSE 3000

ENV PORT 3000

CMD ["server.js"]
