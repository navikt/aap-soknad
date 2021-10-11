import { injectDecoratorServerSide } from "@navikt/nav-dekoratoren-moduler/ssr";

export const getHtmlWithDecorator = (filePath: string) =>
  injectDecoratorServerSide({
    dekoratorenUrl: process.env.DECORATOR_URL,
    env: process.env.DECORATOR_ENV as any,
    filePath: filePath,
    simple: true,
    chatbot: false,
    urlLookupTable: false,
  });
