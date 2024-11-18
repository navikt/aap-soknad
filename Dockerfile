FROM gcr.io/distroless/nodejs20-debian12@sha256:203bf034b174d1d5fd5522af197df29ed0956d2c72d9733ae75145f3f4c231bc


WORKDIR /app
COPY .next/standalone ./
COPY .next/static ./.next/static

ENV NODE_ENV production

EXPOSE 3000

ENV PORT 3000

CMD ["server.js"]
