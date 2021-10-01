FROM navikt/node-express:14-alpine
ENV NODE_ENV production

WORKDIR /app
COPY server/dist/ ./server
COPY server/package.json ./server/package.json
COPY server/yarn.lock ./server/yarn.lock
COPY build/ ./build


USER root
RUN chown -R apprunner:apprunner /app
USER apprunner
WORKDIR /app/server
RUN yarn install --frozen-lockfile

WORKDIR /app
EXPOSE 3000
CMD ["node", "server/server.js"]