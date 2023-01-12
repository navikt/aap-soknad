// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { render as rtlRender } from '@testing-library/react';
import { AppStateContext, AppStateContextState } from 'context/appStateContext';
import { SoknadContextData } from 'context/soknadContextCommon';
import { SoknadContextStandard } from 'context/soknadContextStandard';
import { StepWizardContext, StepWizardContextState } from 'context/stepWizardContextV2';
import { ReactElement } from 'react';
import { IntlProvider } from 'react-intl';
import { Soknad } from 'types/Soknad';
import { SøknadType } from 'types/SoknadContext';
import { messages, flattenMessages } from 'utils/message';
import links from 'translations/links.json';

const tekster = { ...messages['nb'], ...flattenMessages({ applinks: links }) };
function render(ui: ReactElement, { locale = 'nb', ...options } = {}) {
  function Wrapper({ children }: { children: ReactElement }): ReactElement {
    return (
      <IntlProvider locale={locale} messages={tekster}>
        {children}
      </IntlProvider>
    );
  }
  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

function renderStepSoknadStandard(
  stepName: string,
  ui: ReactElement,
  { locale = 'nb', ...options } = {}
) {
  function ProvidersWrapper({ children }: { children: ReactElement }): ReactElement {
    const soknadContext: SoknadContextData<Soknad> = {
      søknadState: {
        version: 1,
        type: SøknadType.STANDARD,
        requiredVedlegg: [],
      },
      søknadDispatch: () => {},
    };
    const wizardContext: StepWizardContextState = {
      stepList: [{ name: stepName }],
      currentStep: { name: stepName },
      currentStepIndex: 0,
      stepWizardDispatch: () => ({}),
    };
    const appContext: AppStateContextState = {
      appState: {
        sistLagret: 'i dag',
      },
      appStateDispatch: () => {},
    };
    return (
      <IntlProvider locale={locale} messages={tekster}>
        <AppStateContext.Provider value={{ ...appContext }}>
          <SoknadContextStandard.Provider value={{ ...soknadContext }}>
            <StepWizardContext.Provider value={{ ...wizardContext }}>
              {children}
            </StepWizardContext.Provider>
            ,
          </SoknadContextStandard.Provider>
        </AppStateContext.Provider>
      </IntlProvider>
    );
  }
  return rtlRender(ui, { wrapper: ProvidersWrapper, ...options });
}

// Mocker resize observer da jsdom ikke implementerer denne
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

export * from '@testing-library/react';
export { render, renderStepSoknadStandard };
