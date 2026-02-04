import { afterEach, beforeAll, vi, expect } from 'vitest';
import { cleanup, render as rtlRender } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import 'vitest-axe/extend-expect';
import * as matchers from 'vitest-axe/matchers';
import links from 'translations/links.json';

import createFetchMock from 'vitest-fetch-mock';
import { flattenMessages, messages } from 'utils/message';
import { ReactElement, ReactNode, useReducer } from 'react';
import { IntlProvider } from 'react-intl';
import {
  SoknadContext,
  soknadContextInititalState,
  SoknadContextState,
  SoknadContextType,
} from 'context/soknadcontext/soknadContext';
import { soknadReducer } from 'context/soknadcontext/reducer';
import { StepWizardContext, StepWizardContextState } from 'context/stepWizardContext';
import { AppStateContext, AppStateContextState } from 'context/appStateContext';

expect.extend(matchers);

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

fetchMocker.mockResponse({ status: 200 });

vi.mock('next/router', () => ({ useRouter: vi.fn() }));

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

beforeAll(() => {
  vi.mock('next/navigation', () => ({
    useParams: vi.fn().mockReturnValue({ referanse: '123', innsendingtype: 'innsending' }),
    useRouter: vi.fn().mockReturnValue({ prefetch: () => null }),
  }));

  vi.mock('i18n/routing', () => ({
    // Mocker opp Link til å returnere en a tag slik at vi får korrekt rolle i tester
    Link: vi.fn().mockImplementation(({ href, children, ...props }) => (
      <a href={href} {...props}>
        {children}
      </a>
    )),
    redirect: vi.fn(),
    usePathname: vi
      .fn()
      .mockReturnValue('/sett-inn-riktig-value-her-hvis-det-trengs-en-gang-i-fremtiden'),
    useRouter: vi.fn().mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    }),
  }));
});

afterEach(() => {
  cleanup();
});

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

// Mocker scrollIntoView da jsdom ikke implementerer denne
window.HTMLElement.prototype.scrollIntoView = function () {};

// Mock HTMLCanvasElement.getContext for canvas-støtte
window.HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({});

export * from '@testing-library/react';
export { render, renderStepSoknadStandard };
