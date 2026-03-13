import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import linksJson from '../translations/links.json';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  const messages = (await import(`../translations/${locale}.json`)).default;

  return {
    locale,
    messages: {
      ...messages,
      applinks: linksJson,
    },
  };
});
