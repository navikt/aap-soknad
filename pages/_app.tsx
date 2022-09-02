import '@navikt/ds-css';
import 'styles/index.css';

import React, { useEffect, useMemo } from 'react';
import * as Sentry from '@sentry/react';
import { IntlProvider } from 'react-intl';
import { AppProps } from 'next/app';
import { Modal } from '@navikt/ds-react';

import links from 'translations/links.json';
import { messages, flattenMessages } from 'utils/message';
import { SokerOppslagProvider } from 'context/sokerOppslagContext';
import { StepWizardProvider } from 'context/stepWizardContextV2';
import { initAmplitude } from 'utils/amplitude';
import ErrorPage from 'components/error/ErrorPage';
const CustomApp = ({ Component, pageProps }: AppProps) => {
  const locale = 'nb';

  const currentMessages = useMemo(
    () => ({ ...messages[locale], ...flattenMessages({ applinks: links }) }),
    [locale]
  );

  useEffect(() => {
    initAmplitude();
  }, []);

  if (Modal.setAppElement) {
    Modal.setAppElement('#__next');
  }

  return (
    <IntlProvider locale={locale} messages={currentMessages}>
      <SokerOppslagProvider>
        <StepWizardProvider>
          <Sentry.ErrorBoundary fallback={(props) => <ErrorPage {...props} />} showDialog={false}>
            <Component {...pageProps} />
          </Sentry.ErrorBoundary>
        </StepWizardProvider>
      </SokerOppslagProvider>
    </IntlProvider>
  );
};

export default CustomApp;
