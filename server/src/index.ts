import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import client from 'prom-client';
import config from './config';
import { getHtmlWithDecorator } from './dekorator';
import { tokenXProxy } from './apiProxy';
import { LogError, LogInfo } from './logger';
import { enforceIDPortenAuthenticationMiddleware } from './auth/middleware';
import { logClientError } from './clientLogger';

const BUILD_PATH = path.join(__dirname, '../dist');
const PORT = process.env.PORT || 3000;
const server = express();

const startServer = () => {
  // Create a Registry which registers the metrics
  const register = new client.Registry();
  // Add a default label which is added to all metrics
  register.setDefaultLabels({
    app: 'aap-soknad',
  }); // Enable the collection of default metrics
  client.collectDefaultMetrics({ register });

  server.use(cookieParser());
  server.use(express.static(BUILD_PATH));
  // server.use(helmet());

  // metrics
  server.get(`${config.BASE_PATH}/internal/metrics`, async (req: any, res: any) => {
    res.setHeader('Content-Type', register.contentType);
    res.end(await register.metrics());
  });
  // health checks
  server.get(
    [`${config.BASE_PATH}/internal/isAlive`, `${config.BASE_PATH}/internal/isReady`],
    (req: any, res: any) => res.sendStatus(200)
  );

  // Enforce idporten authentication
  server.use(`${config.BASE_PATH}/*`, enforceIDPortenAuthenticationMiddleware);

  // Client error logger
  server.use(
    `${config.BASE_PATH}/client-logger/error`,
    express.json({ limit: '50mb' }),
    logClientError
  );

  // Reverse proxy to add tokenx header for api calls
  tokenXProxy(`${config.BASE_PATH}/soknad-api`, server);

  // Render app
  server.get(`${config.BASE_PATH}/*`, (req: any, res: any) =>
    getHtmlWithDecorator(`${BUILD_PATH}/index.html`)
      .then((html) => {
        res.send(html);
      })
      .catch((e) => {
        LogError('Dekoratøren error', e);
        res.status(500).send(e);
      })
  );

  server.listen(PORT, () => {
    LogInfo(`Server started: listening on port ${PORT}`);
  });
};

startServer();
