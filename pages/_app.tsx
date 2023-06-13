import '@navikt/ds-css';
import '@navikt/aap-felles-css';
import 'styles/index.css';
import React, { useEffect, useMemo } from 'react';
import { IntlProvider } from 'react-intl';
import { AppProps } from 'next/app';
import { Modal } from '@navikt/ds-react';
import links from 'translations/links.json';
import { messages, flattenMessages } from 'utils/message';
import { SokerOppslagProvider } from 'context/sokerOppslagContext';
import { StepWizardProvider } from 'context/stepWizardContextV2';
import { initAmplitude } from 'utils/amplitude';
import { AppStateContextProvider } from 'context/appStateContext';
import Head from 'next/head';
import { SUPPORTED_LOCALE } from 'lib/translations/locale';
import { useRouter } from 'next/router';
import { NavDecorator } from 'components/NavDecorator/NavDecorator';
import { Locale } from '@navikt/nav-dekoratoren-moduler';

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
    () => ({ ...messages[locale as Locale], ...flattenMessages({ applinks: links }) }),
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
