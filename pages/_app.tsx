import '@navikt/ds-css';
import '@navikt/aap-felles-css';
import 'styles/index.css';
import React, { useEffect, useMemo } from 'react';
import { IntlProvider } from 'react-intl';
import { AppProps } from 'next/app';
import links from 'translations/links.json';
import { messages, flattenMessages } from 'utils/message';
import { SokerOppslagProvider } from 'context/sokerOppslagContext';
import { StepWizardProvider } from 'context/stepWizardContext';
import { initAmplitude } from 'utils/amplitude';
import { AppStateContextProvider } from 'context/appStateContext';
import Head from 'next/head';
import { SUPPORTED_LOCALE } from 'lib/translations/locale';
import { useRouter } from 'next/router';
import { NavDecorator } from 'components/NavDecorator/NavDecorator';
import { DecoratorLocale } from '@navikt/nav-dekoratoren-moduler';
import { initializeFaro } from '@grafana/faro-web-sdk';

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

  useEffect(() => {
    initAmplitude();
  }, []);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_FARO_URL) {
      initializeFaro({
        url: process.env.NEXT_PUBLIC_FARO_URL,
        app: {
          name: 'aap-soknad',
          version: process.env.NEXT_PUBLIC_ENVIRONMENT ?? '',
        },
      });
    }
  }, []);

  return (
    <IntlProvider locale={locale} messages={currentMessages}>
      <AppStateContextProvider>
        <SokerOppslagProvider>
          <NavDecorator>
            <StepWizardProvider>
              <Head>
                <title>Søknad om arbeidsavklaringspenger (AAP)</title>
              </Head>
              <Component {...pageProps} />
            </StepWizardProvider>
          </NavDecorator>
        </SokerOppslagProvider>
      </AppStateContextProvider>
    </IntlProvider>
  );
};

export default CustomApp;
