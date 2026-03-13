import React from 'react';
import '@navikt/ds-css';
import '@navikt/aap-felles-css';
import 'styles/index.css';
import { getMessages } from 'next-intl/server';
import { Providers } from 'components/Providers/Providers';
import { fetchDecoratorReact } from '@navikt/nav-dekoratoren-moduler/ssr';
import { getEnvironment } from '../../utils/environments';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const Decorator = await fetchDecoratorReact({ env: getEnvironment() });

  return (
    <html>
      <head>
        <meta name="robots" content="noindex,nofollow" />
        <Decorator.Styles />
        <Decorator.Scripts />
      </head>
      <body>
        <Decorator.Header />
        <div id="app" className="app">
          <Providers locale={locale} messages={messages as Record<string, unknown>}>
            {children}
          </Providers>
        </div>
        <Decorator.Footer />
      </body>
    </html>
  );
}
