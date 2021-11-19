import {useEffect, useState} from 'react';
import { onLanguageSelect } from '@navikt/nav-dekoratoren-moduler'
import nbTexts from "../texts/nb.json";
import enTexts from "../texts/en.json";

export interface GetText { (str: string): string }

const useTexts = (pageName: string)=> {
  const [language, setLanguage] = useState<string>('nb');
  const [texts, setTexts] = useState<object>({})

  onLanguageSelect(({ locale}) => setLanguage(locale));

  useEffect(() => {
    const getTextsForPage = () => {
      let rootText;
      switch (language) {
      case 'nb':
        rootText = nbTexts;
        break;
      case 'en':
        rootText = enTexts;
        break;
      default:
        rootText = nbTexts;
        break;
      }
      // @ts-ignore
      const pageTexts = rootText[pageName];
      setTexts(pageTexts);
    };
    getTextsForPage();
  }, [pageName, language]);

  const getText = (path: string): string => safeDeepGet(texts, path);

  return {language, pageTexts: texts, getText};
}
const safeDeepGet = (obj: any, path: string) => {
  try {
    return path.split('.')
      .reduce((acc: any, curr: string) => {
        // @ts-ignore
        return acc?.[curr];
      },obj)
  } catch (e) {
    console.error('safeDeepGet', e);
    return '';
  }
}

export default useTexts;
