'use client';

import React, { useEffect } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { AppStateContextProvider } from 'context/appStateContext';
import { StepWizardProvider } from 'context/stepWizardContext';
import { SoknadContextProvider } from 'context/soknadcontext/soknadContext';
import { setAvailableLanguages, onLanguageSelect } from '@navikt/nav-dekoratoren-moduler';
import { useRouter, usePathname } from 'i18n/routing';
import { initializeFaro } from '@grafana/faro-web-sdk';

interface Props {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, unknown>;
}

function NavDecoratorIntegration({ locale }: { locale: string }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setAvailableLanguages([
      { locale: 'nb', handleInApp: true },
      { locale: 'nn', handleInApp: true },
    ]);
  }, []);

  onLanguageSelect((language) => {
    router.replace(pathname, { locale: language.locale });
  });

  return null;
}

export function Providers({ children, locale, messages }: Props) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_FARO_URL) {
      initializeFaro({
        url: process.env.NEXT_PUBLIC_FARO_URL,
        app: {
          name: 'aap-soknad',
          version: process.env.NEXT_PUBLIC_ENVIRONMENT ?? '',
        },
      });
    }
  }, []);

  return (
    <NextIntlClientProvider timeZone={'Europe/Oslo'} locale={locale} messages={messages}>
      <AppStateContextProvider>
        <StepWizardProvider>
          <SoknadContextProvider>
            <NavDecoratorIntegration locale={locale} />
            {children}
          </SoknadContextProvider>
        </StepWizardProvider>
      </AppStateContextProvider>
    </NextIntlClientProvider>
  );
}
