'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import type { Locale } from '@/i18n/config';
import { locales } from '@/i18n/config';
import { getLocaleFromPath, localizeHref } from '@/lib/locale';
import { cn } from '@/lib/utils';
import { Globe, Check } from 'lucide-react';
import { DropdownMenu } from '@/components/ui/dropdown-menu';

const languages: Record<Locale, { label: string; flag: string }> = {
  en: { label: 'English', flag: '🇺🇸' },
  tr: { label: 'Türkçe', flag: '🇹🇷' },
  es: { label: 'Español', flag: '🇪🇸' },
  de: { label: 'Deutsch', flag: '🇩🇪' },
};

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = getLocaleFromPath(pathname) as Locale;

  function handleChange(nextLocale: Locale) {
    if (nextLocale === locale) return;
    const query = searchParams.toString();
    const href = localizeHref(pathname, nextLocale);
    const target = query ? `${href}?${query}` : href;

    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    window.location.href = target;
  }

  return (
    <div className={cn('relative', className)}>
      <DropdownMenu
        trigger={
          <button
            type="button"
            className="flex items-center justify-center rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Change language"
          >
            <Globe className="h-5 w-5" />
          </button>
        }
        align="right"
      >
        <div className="py-1">
          {locales.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleChange(item)}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-100',
                item === locale
                  ? 'font-medium text-gray-900'
                  : 'text-gray-700'
              )}
            >
              <span className="text-lg leading-none">{languages[item].flag}</span>
              <span className="flex-1 text-left">{languages[item].label}</span>
              {item === locale && (
                <Check className="h-4 w-4 text-green-500" />
              )}
            </button>
          ))}
        </div>
      </DropdownMenu>
    </div>
  );
}