'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { resetPassword } from '@/actions/auth';
import { forgotPasswordSchema } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import type { Locale } from '@/i18n/config';
import { localizeHref } from '@/lib/locale';

export default function ForgotPasswordPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations('auth.forgotPassword');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      toast(parsed.error.issues[0].message, 'error');
      setLoading(false);
      return;
    }

    const response = await resetPassword({ email });
    if (response.success) {
      setSent(true);
    } else {
      toast(response.error || t('submit'), 'error');
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('success.title')}</h1>
        <p className="text-sm text-gray-500">
          {t('success.description')}
        </p>
        <Link href={localizeHref('/login', locale)}>
          <Button variant="outline" className="mt-4">
            {t('success.backToSignIn')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-2 text-sm text-gray-500">
          {t('subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email"
          name="email"
          type="email"
          label={t('email')}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t('sending') : t('submit')}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500">
        {t('rememberPassword')}{' '}
        <Link href={localizeHref('/login', locale)} className="font-medium text-gray-900 hover:underline">
          {t('signIn')}
        </Link>
      </p>
    </div>
  );
}
