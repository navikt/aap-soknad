FROM gcr.io/distroless/nodejs20-debian12@sha256:8d4c80b44d6f77faa85e175590655d3888510faaed8502615e214db80dc2a3a9

WORKDIR /app
COPY .next/standalone ./
COPY .next/static ./.next/static

ENV NODE_ENV=production

EXPOSE 3000

ENV PORT=3000

CMD ["server.js"]
