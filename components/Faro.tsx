'use client';

import { useEffect } from 'react';
import {  getWebInstrumentations, initializeFaro, LogLevel } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

export default function Faro({ collectorUrl }: { collectorUrl?: string }) {
  useEffect(() => {

    try {
      initializeFaro({
        url: collectorUrl || 'https://telemetry.nav.no/collect',
        paused: window.location.hostname === 'localhost',
        app: {
          name: 'soknad',
          namespace: 'aap',
        },
        instrumentations: [
          ...getWebInstrumentations(),
          new TracingInstrumentation({
            instrumentationOptions: {
              propagateTraceHeaderCorsUrls: [/https:\/\/[^/]+\.nav\.no\/.*/],
            },
          }),
        ],
        consoleInstrumentation: {
          disabledLevels: [LogLevel.DEBUG, LogLevel.TRACE], // capture log, info, warn, error
        },
      });
    } catch (e) {
      console.warn('Faro initialization failed', e);
    }
  }, [collectorUrl]);

  return null;
}
