import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
import {
  DecoratorComponentsReact,
  DecoratorFetchProps,
  DecoratorEnvProps,
  fetchDecoratorReact,
} from '@navikt/nav-dekoratoren-moduler/ssr';

import React from 'react';

const decoratorEnv = process.env.DECORATOR_ENV as Exclude<DecoratorEnvProps['env'], 'localhost'>;

const decoratorParams: DecoratorFetchProps = {
  env: decoratorEnv ?? 'prod',
  serviceDiscovery: true,
  params: {
    context: 'privatperson',
    chatbot: false,
    feedback: false,
    simple: true,
    logoutWarning: true,
  },
};

class _Document extends Document<{ decorator: DecoratorComponentsReact }> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    const decorator = await fetchDecoratorReact(decoratorParams);
    return { ...initialProps, decorator };
  }

  render() {
    const { HeadAssets, Scripts, Header, Footer } = this.props.decorator;
    return (
      <Html>
        <Head>
          <meta name="robots" content="noindex,nofollow" />
          <HeadAssets />
        </Head>
        <Scripts />

        <body>
          <Header />
          <div id="app" className="app">
            <Main />
          </div>
          <Footer />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default _Document;
