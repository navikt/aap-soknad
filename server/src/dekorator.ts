import { injectDecoratorServerSide } from "@navikt/nav-dekoratoren-moduler/ssr";

export const getHtmlWithDecorator = (filePath: string) =>
  injectDecoratorServerSide({
    dekoratorenUrl: `${process.env.DECORATOR_URL}/?breadcrumbs=[{"url":"https://www.nav.no/person/dittnav","title":"Ditt NAV"},{"url":"https://www.nav.no/person/kontakt-oss","title":"Kontakt oss"}]&availableLanguages=[{"locale":"nb","url":"https://www.nav.no/person/kontakt-oss"},{"locale":"en","url":"https://www.nav.no/person/kontakt-oss/en/"}]`,
    env: process.env.DECORATOR_ENV as any,
    filePath: filePath,
    simple: true,
    chatbot: false,
    urlLookupTable: false,
  });
