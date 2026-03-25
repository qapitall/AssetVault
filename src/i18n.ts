import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, isValidLocale, type Locale } from '@/i18n/config';
import deMessages from '@/messages/de.json';
import enMessages from '@/messages/en.json';
import esMessages from '@/messages/es.json';
import trMessages from '@/messages/tr.json';

const messagesByLocale: Record<Locale, typeof enMessages> = {
  en: enMessages,
  tr: trMessages,
  es: esMessages,
  de: deMessages,
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const resolvedLocale = isValidLocale(requested) ? requested : defaultLocale;
  return {
    locale: resolvedLocale,
    messages: messagesByLocale[resolvedLocale],
  };
});
