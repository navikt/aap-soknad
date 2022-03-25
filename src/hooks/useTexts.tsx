import { useEffect, useState } from 'react';
import { onLanguageSelect } from '@navikt/nav-dekoratoren-moduler';
import { Link } from '@navikt/ds-react';

export interface GetText {
  (str: string): string;
}

type Tekst = {
  [key: string]: object | string;
};

interface Tekstpakker {
  [key: string]: Tekst;
}

const getLink = (link: { href: string; name: string }) => {
  return link?.href && link?.name ? <Link href={link.href}>{link?.name}</Link> : <></>;
};
export const getLinks = (path: string, getText: (path: string) => any) => {
  const linkList = getText(path);
  return Array.isArray(linkList) ? linkList.map((link) => getLink(link)) : [];
};

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
  return { language, pageTexts: filteredTexts, getText, getLinks };
};

export default useTexts;
