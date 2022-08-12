// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { render as rtlRender } from '@testing-library/react';
import { ReactElement } from 'react';
import { IntlProvider } from 'react-intl';
import { BrowserRouter } from 'react-router-dom';
import { messages } from 'utils/message';

function render(ui: ReactElement, { locale = 'nb', ...options } = {}) {
  function Wrapper({ children }: { children: ReactElement }): ReactElement {
    return (
      <IntlProvider locale={locale} messages={messages['nb']}>
        <BrowserRouter>{children}</BrowserRouter>
      </IntlProvider>
    );
  }
  return rtlRender(ui, { wrapper: Wrapper, ...options });
}
export * from '@testing-library/react';
export { render };
