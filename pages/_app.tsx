import '@navikt/ds-css';

import { AppProps } from 'next/app';
import { SoknadContextProvider } from '../src/context/soknadContext';

const CustomApp = ({ Component, pageProps }: AppProps) => {
  return (
    <SoknadContextProvider>
      <Component {...pageProps} />
    </SoknadContextProvider>
  );
};

export default CustomApp;
