import React from 'react';
import { render } from 'react-dom';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import App from './App';
import '@navikt/ds-css';

if (process.env.USE_MOCK === 'true') {
  const { worker } = require('./mocks/browser');
  worker.start();
}

Sentry.init({
  dsn: 'https://816b41ce540d4024982ffbf3e3d9dac7@sentry.gc.nav.no/119',
  integrations: [new Integrations.BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

const app = document.getElementById('app');
render(
  <div className="app-container">
    <App />
  </div>,
  app
);
