import { collectDefaultMetrics, Counter, Histogram } from 'prom-client';
import { logger } from '@navikt/aap-felles-innbygger-utils';

declare global {
  var _metrics: AppMetrics;
}

export class AppMetrics {
  constructor() {
    logger.info('Initializing metrics client');
    collectDefaultMetrics();
  }

  public backendApiDurationHistogram = new Histogram({
    name: 'aap_soknad_requests_duration_seconds',
    help: 'Load time for API call to soknad-api-backend',
    labelNames: ['path'],
  });

  public backendApiStatusCodeCounter = new Counter({
    name: 'aap_soknad_requests_status_code',
    help: 'Status code for API call to soknad-api-backend',
    labelNames: ['path', 'status'],
  });

  public getServersidePropsDurationHistogram = new Histogram({
    name: 'aap_soknad_get_serverside_props_duration_seconds',
    help: 'Load time for getServerSideProps',
    labelNames: ['path'],
  });
}

global._metrics = global._metrics || new AppMetrics();

export default global._metrics;
