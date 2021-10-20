import { injectDecoratorServerSide } from "@navikt/nav-dekoratoren-moduler/ssr";
import config from "./config";

export const getHtmlWithDecorator = (filePath: string) =>
  injectDecoratorServerSide({
    dekoratorenUrl: `${process.env.DECORATOR_URL}/?&availableLanguages=[{"locale":"nb","url":"https://www.nav.no/person/kontakt-oss"},{"locale":"en","url":"https://www.nav.no/person/kontakt-oss/en/"}]`,
    env: process.env.DECORATOR_ENV as any,
    breadcrumbs: [
      {url:'https://www.nav.no/person/dittnav',title:'Ditt NAV'},
      {url: `${config.APP_URL}/aap/`,title: 'AAP'}
    ],
    availableLanguages: [
      {locale: 'nb', handleInApp: true },
      {locale: 'en', handleInApp: true },
    ],
    filePath: filePath,
    simple: true,
    chatbot: false,
    urlLookupTable: false,
  });
