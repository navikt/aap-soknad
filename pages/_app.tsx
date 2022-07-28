import '@navikt/ds-css';
import '../src/index.css';

import React, { useEffect, useMemo } from 'react';
import { IntlProvider } from 'react-intl';
import { AppProps } from 'next/app';
import { Modal } from '@navikt/ds-react';

import links from '../src/translations/links.json';
import { messages, flattenMessages } from '../src/utils/message';
import { SokerOppslagProvider } from '../src/context/sokerOppslagContext';
import { VedleggContextProvider } from '../src/context/vedleggContext';
import { StepWizardProvider } from '../src/context/stepWizardContextV2';
import { initAmplitude } from '../utils/amplitude';

if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
  require('../src/mocks/nextjs');
}

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
        <VedleggContextProvider>
          <StepWizardProvider>
            <Component {...pageProps} />
          </StepWizardProvider>
        </VedleggContextProvider>
      </SokerOppslagProvider>
    </IntlProvider>
  );
};

export default CustomApp;
