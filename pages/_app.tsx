import '@navikt/ds-css';
import '@navikt/aap-felles-css';
import 'styles/index.css';
import React, { useMemo } from 'react';
import { IntlProvider } from 'react-intl';
import { AppProps } from 'next/app';
import links from 'translations/links.json';
import { messages, flattenMessages } from 'utils/message';
import { StepWizardProvider } from 'context/stepWizardContext';
import { AppStateContextProvider } from 'context/appStateContext';
import Head from 'next/head';
import { SUPPORTED_LOCALE } from 'lib/translations/locale';
import { useRouter } from 'next/router';
import { NavDecorator } from 'components/NavDecorator/NavDecorator';
import { DecoratorLocale } from '@navikt/nav-dekoratoren-moduler';
import Faro from 'components/Faro';
import ErrorBoundary from 'components/ErrorBoundary';

const getLocaleOrFallback = (locale?: string) => {
  if (locale && SUPPORTED_LOCALE.includes(locale)) {
    return locale;
  }

  return 'nb';
};

const CustomApp = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const locale = getLocaleOrFallback(router.locale);

  const currentMessages = useMemo(
    () => ({ ...messages[locale as DecoratorLocale], ...flattenMessages({ applinks: links }) }),
    [locale],
  );

  return (
    <ErrorBoundary>
      <IntlProvider locale={locale} messages={currentMessages}>
        <AppStateContextProvider>
          <NavDecorator>
            <StepWizardProvider>
              <Head>
                <title>Søknad om arbeidsavklaringspenger (AAP)</title>
              </Head>
              <Faro collectorUrl={process.env.NAIS_FRONTEND_TELEMETRY_COLLECTOR_URL} />
              <Component {...pageProps} />
            </StepWizardProvider>
          </NavDecorator>
        </AppStateContextProvider>
      </IntlProvider>
    </ErrorBoundary>
  );
};

export default CustomApp;
