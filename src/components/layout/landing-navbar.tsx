import { Suspense } from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/layout/language-switcher';

interface LandingNavbarProps {
  locale: string;
}

export async function LandingNavbar({ locale }: LandingNavbarProps) {
  const tNav = await getTranslations({ locale, namespace: 'layout.nav' });

  return (
    <header className="border-b border-blue-100/50 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href={`/${locale}`}>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AssetVault
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Suspense fallback={null}>
            <LanguageSwitcher />
          </Suspense>
          <Link href={`/${locale}/login`}>
            <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
              {tNav('signIn')}
            </Button>
          </Link>
          <Link href={`/${locale}/signup`}>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-200">
              {tNav('getStarted')}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
