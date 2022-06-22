import React, { useMemo, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Button, Heading } from '@navikt/ds-react';
import { ErrorBoundary } from 'react-error-boundary';
import { captureException } from '@sentry/react';
import { IntlProvider } from 'react-intl';
import { onLanguageSelect } from '@navikt/nav-dekoratoren-moduler';
import { SoknadContextProvider } from './context/soknadContext';
import { StepWizardProvider } from './context/stepWizardContextV2';
import { SokerOppslagProvider } from './context/sokerOppslagContext';

// Pages
import Utland from './pages/utland/Utland';
import StandardPage from './pages/standard';
import { Feilviser } from './components/Feilviser/Feilviser';
import { logError } from './utils/clientLogger';
import { VedleggContextProvider } from './context/vedleggContext';

function flattenMessages(nestedMessages: object, prefix = '') {
  return Object.keys(nestedMessages).reduce((messages, key) => {
    // @ts-ignore
    let value = nestedMessages[key];
    let prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      // @ts-ignore
      messages[prefixedKey] = value;
    } else {
      Object.assign(messages, flattenMessages(value, prefixedKey));
    }

    return messages;
  }, {});
}
import links from './translations/links.json';
import messagesNb from './translations/nb.json';
type Locale = 'nb' | 'en';
type Messages = {
  [K in Locale]?: { [name: string]: string };
};
export const messages: Messages = {
  nb: flattenMessages(messagesNb),
};

const App = (): JSX.Element => {
  const [locale, setLocale] = useState<Locale>('nb');
  onLanguageSelect(({ locale }) => setLocale(locale as Locale));
  const currentMessages = useMemo(
    () => ({ ...messages[locale], ...flattenMessages({ applinks: links }) }),
    [locale]
  );

  return (
    <ErrorBoundary
      FallbackComponent={Feilviser}
      onError={(error, errorStack) =>
        logError(error, errorStack?.componentStack).then(() => captureException(error))
      }
    >
      <div className="app">
        <IntlProvider locale={locale} messages={currentMessages}>
          <SoknadContextProvider>
            <SokerOppslagProvider>
              <VedleggContextProvider>
                <StepWizardProvider>
                  <BrowserRouter>
                    <Routes>
                      <Route path="/aap/utland" element={<Utland />} />
                      <Route path="/aap/standard" element={<StandardPage />} />
                      <Route
                        path="*"
                        element={
                          <>
                            <Heading size={'xlarge'} level={'1'} spacing={true}>
                              AAP App
                            </Heading>
                            <Button
                              onClick={() => {
                                console.log('USE_MOCK', process.env.USE_MOCK);
                                console.log('NODE_ENV', process.env.NODE_ENV);
                              }}
                            >
                              USE MOCK
                            </Button>
                            <span>Not Found</span>
                          </>
                        }
                      />
                    </Routes>
                  </BrowserRouter>
                </StepWizardProvider>
              </VedleggContextProvider>
            </SokerOppslagProvider>
          </SoknadContextProvider>
        </IntlProvider>
      </div>
    </ErrorBoundary>
  );
};

export default App;
