export const locales = ['en', 'tr', 'es', 'de'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export function isValidLocale(locale: unknown): locale is Locale {
  return locales.includes(locale as Locale);
}