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

class _Document extends Document<{ Decorator: DecoratorComponentsReact }> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    const Decorator = await fetchDecoratorReact(decoratorParams);
    return { ...initialProps, Decorator };
  }

  render() {
    const { Decorator } = this.props;
    return (
      <Html>
        <Head>
          <Decorator.HeadAssets />
          <meta name="robots" content="noindex,nofollow" />
        </Head>

        <body>
          <Decorator.Header />
          <div id="app" className="app">
            <Main />
          </div>
          <Decorator.Footer />
          <Decorator.Scripts />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default _Document;
