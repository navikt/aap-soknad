import { setAvailableLanguages, onLanguageSelect } from '@navikt/nav-dekoratoren-moduler';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

export const NavDecorator = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { pathname, asPath, query } = router;

  useEffect(() => {
    setAvailableLanguages([
      {
        locale: 'nb',
        handleInApp: true,
      },
      {
        locale: 'nn',
        handleInApp: true,
      },
    ]);
  }, []);

  onLanguageSelect((language) => {
    router.push({ pathname, query }, asPath, { locale: language.locale });
  });

  return <>{children}</>;
};
