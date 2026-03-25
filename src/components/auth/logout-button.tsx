'use client';

import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { signOut } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import { localizeHref } from '@/lib/locale';

interface LogoutButtonProps {
  variant?: 'default' | 'ghost';
}

export function LogoutButton({ variant = 'ghost' }: LogoutButtonProps) {
  const router = useRouter();
  const locale = useLocale() as Locale;
  const t = useTranslations('layout.userMenu');

  async function handleLogout() {
    await signOut();
    router.push(localizeHref('/login', locale));
    router.refresh();
  }

  return (
    <Button variant={variant} size="sm" onClick={handleLogout} className="gap-2">
      <LogOut className="h-4 w-4" />
      {t('signOut')}
    </Button>
  );
}
