FROM gcr.io/distroless/nodejs20-debian12@sha256:55fcbc1b781606f4aa3587d3ee174a8acfc975b02a3ea252cef282895ac362d5


WORKDIR /app
COPY .next/standalone ./
COPY .next/static ./.next/static

ENV NODE_ENV production

EXPOSE 3000

ENV PORT 3000

CMD ["server.js"]
