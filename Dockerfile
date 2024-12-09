FROM gcr.io/distroless/nodejs20-debian12@sha256:a6c0e95f6f70fb21586757a846d8b8d287609f2414bcc2399895adb055768648


WORKDIR /app
COPY .next/standalone ./
COPY .next/static ./.next/static

ENV NODE_ENV production

EXPOSE 3000

ENV PORT 3000

CMD ["server.js"]
