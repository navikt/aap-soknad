import React, { useMemo, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Button, Heading } from '@navikt/ds-react';
import { ErrorBoundary } from 'react-error-boundary';
import { captureException } from '@sentry/react';
import { IntlProvider } from 'react-intl';
import { onLanguageSelect } from '@navikt/nav-dekoratoren-moduler';
import { SoknadContextProviderUtland } from './context/soknadContextUtland';
import { StepWizardProvider } from './context/stepWizardContextV2';
import { SokerOppslagProvider } from './context/sokerOppslagContext';
import { SoknadContextProviderStandard } from './context/soknadContextStandard';

// Pages
import Utland from './pages/utland/Utland';
import StandardPage from './pages/standard';
import { Feilviser } from './components/Feilviser/Feilviser';
import { logError } from './utils/clientLogger';
import links from './translations/links.json';
import VedleggVisning from './pages/VedleggVisning';
import { messages, flattenMessages, Locale } from './utils/message';

const UtlandWithContext = () => (
  <SoknadContextProviderUtland>
    <Utland />
  </SoknadContextProviderUtland>
);
const StandardWithContext = () => (
  <SoknadContextProviderStandard>
    <StandardPage />
  </SoknadContextProviderStandard>
);

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
          <SokerOppslagProvider>
            <StepWizardProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/aap/utland" element={<UtlandWithContext />} />
                  <Route path="/aap/standard" element={<StandardWithContext />} />
                  <Route path="/aap/vedleggvisning/:id" element={<VedleggVisning />} />
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
          </SokerOppslagProvider>
        </IntlProvider>
      </div>
    </ErrorBoundary>
  );
};

export default App;
