import React from 'react';
import './App.less';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Button, Heading } from '@navikt/ds-react';
import { ErrorBoundary } from 'react-error-boundary';
import { ModalProvider } from './context/modalContext';
import { SoknadContextProvider } from './context/soknadContext';
// import { StepWizardContextProvider} from "./context/stepWizardContext";
import { StepWizardProvider } from './context/stepWizardContextV2';
import { SokerOppslagProvider } from './context/sokerOppslagContext';

// Pages
import Me from './pages/Me';
import { Bedrift } from './pages/bedrift/Bedrift';
import Utland from './pages/utland/Utland';
import { Hovedsoknad } from './pages/hovedsoknad/Hovedsoknad';
import StandardPage from './pages/standard';
import { Feilviser } from './components/Feilviser/Feilviser';

const App = (): JSX.Element => {
  return (
    <ErrorBoundary FallbackComponent={Feilviser}>
      <div className="app">
        <SoknadContextProvider>
          <SokerOppslagProvider>
            <ModalProvider>
              <StepWizardProvider>
                <BrowserRouter>
                  <Routes>
                    <Route path="/aap" element={<Hovedsoknad />} />
                    <Route path="/aap/me" element={<Me />} />
                    <Route path="/aap/utland" element={<Utland />} />
                    <Route path="/aap/bedrift" element={<Bedrift />} />
                    <Route path="/aap/standard" element={<StandardPage />} />
                    <Route
                      path="*"
                      element={
                        <>
                          <Heading size={'2xlarge'} level={'1'} spacing={true}>
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
            </ModalProvider>
          </SokerOppslagProvider>
        </SoknadContextProvider>
      </div>
    </ErrorBoundary>
  );
};

export default App;
