import {useEffect, useState} from 'react';
import { onLanguageSelect } from '@navikt/nav-dekoratoren-moduler'

export interface GetText { (str: string): string }

type Tekst = {
  [key: string]: object | string
}

interface Tekstpakker {
  [key: string]: Tekst
}

export const useTexts = (tekstpakke: Tekstpakker) => {
  const [language, setLanguage] = useState<string>('nb');
  const [filteredTexts, setFilteredTexts] = useState<object>({})
  onLanguageSelect(({ locale}) => setLanguage(locale));

  useEffect(() => {
    const teksterForSpraak = tekstpakke[language];
    setFilteredTexts(teksterForSpraak);
  }, [language, tekstpakke]);

  const getText = (path: string): string => safeDeepGet(filteredTexts, path);

  return {language, pageTexts: filteredTexts, getText};
}

const safeDeepGet = (obj: any, path: string) => {
  try {
    const res = path.split('.')
      .reduce((acc: any, curr: string) => {
        // @ts-ignore
        return acc?.[curr];
      },obj)
    return res || path;
  } catch (e) {
    console.error('safeDeepGet', e);
    return '';
  }
}

export default useTexts;
