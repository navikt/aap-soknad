import { useEffect, useState } from 'react';
import { onLanguageSelect } from '@navikt/nav-dekoratoren-moduler';

export interface GetText {
  (str: string): string;
}

type Tekst = {
  [key: string]: object | string;
};

interface Tekstpakker {
  [key: string]: Tekst;
}

export const useTexts = (tekstpakke: Tekstpakker) => {
  const [language, setLanguage] = useState<string>('nb');
  const [filteredTexts, setFilteredTexts] = useState<object>({});
  onLanguageSelect(({ locale }) => setLanguage(locale));

  useEffect(() => {
    const teksterForSpraak = tekstpakke[language];
    setFilteredTexts(teksterForSpraak);
  }, [language, tekstpakke]);

  const getText = (path: string, fallbackPath: string = ''): string => {
    const primary = safeDeepGet(path);
    return !primary && fallbackPath ? safeDeepGet(fallbackPath) : primary;
  };

  const safeDeepGet = (path: string) => {
    try {
      const res = path.split('.').reduce((acc: any, curr: string) => {
        // @ts-ignore
        return acc?.[curr];
      }, filteredTexts);
      return res || '';
    } catch (e) {
      console.error('safeDeepGet', e);
      return '';
    }
  };
  return { language, pageTexts: filteredTexts, getText };
};

export default useTexts;
