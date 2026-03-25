import { defaultLocale, isValidLocale, type Locale } from '@/i18n/config';

export function stripLocaleFromPath(pathname: string) {
  const segments = pathname.split('/');

  if (isValidLocale(segments[1])) {
    const nextPath = `/${segments.slice(2).join('/')}`.replace(/\/+/g, '/');
    return nextPath === '/' ? '/' : nextPath.replace(/\/$/, '') || '/';
  }

  return pathname === '' ? '/' : pathname;
}

export function getLocaleFromPath(pathname: string): Locale {
  const locale = pathname.split('/')[1];
  return isValidLocale(locale) ? locale : defaultLocale;
}

export function localizeHref(pathname: string, locale: Locale) {
  const normalizedPath = stripLocaleFromPath(pathname);

  if (normalizedPath === '/') {
    return `/${locale}`;
  }

  return `/${locale}${normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`}`;
}