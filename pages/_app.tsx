import '@navikt/ds-css';

import React, { useMemo } from 'react';
import { IntlProvider } from 'react-intl';
import { AppProps } from 'next/app';

import links from '../src/translations/links.json';
import { messages, flattenMessages } from '../src/utils/message';
import { SokerOppslagProvider } from '../src/context/sokerOppslagContext';
import { VedleggContextProvider } from '../src/context/vedleggContext';
import { StepWizardProvider } from '../src/context/stepWizardContextV2';

const CustomApp = ({ Component, pageProps }: AppProps) => {
  const locale = 'nb';

  const currentMessages = useMemo(
    () => ({ ...messages[locale], ...flattenMessages({ applinks: links }) }),
    [locale]
  );

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
