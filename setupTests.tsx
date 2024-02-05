// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { configure, render as rtlRender } from '@testing-library/react';
import { AppStateContext, AppStateContextState } from 'context/appStateContext';
import { StepWizardContext, StepWizardContextState } from 'context/stepWizardContext';
import { ReactElement, ReactNode, useReducer } from 'react';
import { IntlProvider } from 'react-intl';
import { flattenMessages, messages } from 'utils/message';
import links from 'translations/links.json';
import {
  SoknadContext,
  soknadContextInititalState,
  SoknadContextState,
  SoknadContextType,
} from 'context/soknadcontext/soknadContext';
import { soknadReducer } from 'context/soknadcontext/reducer';

jest.setTimeout(10 * 1000);
configure({ asyncUtilTimeout: 10 * 1000 });

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const tekster = { ...messages['nb'], ...flattenMessages({ applinks: links }) };
function render(ui: ReactElement, { locale = 'nb', ...options } = {}) {
  function Wrapper({ children }: { children: ReactNode }) {
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
  { locale = 'nb', ...options } = {},
  initialState?: SoknadContextState,
) {
  function ProvidersWrapper({ children }: { children: ReactNode }) {
    const initialSoknadContext = initialState || soknadContextInititalState;
    const [state, dispatch] = useReducer(soknadReducer, initialSoknadContext);
    const soknadContext: SoknadContextType = {
      søknadState: state,
      søknadDispatch: dispatch,
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
          <SoknadContext.Provider value={{ ...soknadContext }}>
            <StepWizardContext.Provider value={{ ...wizardContext }}>
              {children}
            </StepWizardContext.Provider>
            ,
          </SoknadContext.Provider>
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

// Mocker scrollIntoView da jsdom ikke implementerer denne
window.HTMLElement.prototype.scrollIntoView = function () {};

export * from '@testing-library/react';
export { render, renderStepSoknadStandard };
