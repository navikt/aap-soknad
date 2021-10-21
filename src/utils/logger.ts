import {
  createFrontendLogger,
  createMockFrontendLogger,
  DEFAULT_FRONTENDLOGGER_API_URL,
  setUpErrorReporting,
} from '@navikt/frontendlogger/lib';

export const logger =
  process.env.NODE_ENV === 'production'
    ? createFrontendLogger('aap-søknad', DEFAULT_FRONTENDLOGGER_API_URL)
    : createMockFrontendLogger('aap-søknad');

export function setupLogger() {
  if (process.env.NODE_ENV === 'production') {
    setUpErrorReporting(logger);
  }
}
