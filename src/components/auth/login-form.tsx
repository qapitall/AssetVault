'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { signIn } from '@/actions/auth';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import type { Locale } from '@/i18n/config';
import { localizeHref } from '@/lib/locale';
export function LoginForm() {
  const locale = useLocale() as Locale;
  const t = useTranslations('auth.login');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput, string>>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const result = loginSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LoginInput;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    const response = await signIn(data);
    if (response.success) {
      window.location.href = localizeHref('/dashboard', locale);
      return;
    } else {
      toast(response.error || 'Failed to sign in', 'error');
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">{t('title')}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {t('subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} method="POST" className="space-y-4">
        <Input
          id="email"
          name="email"
          type="email"
          label={t('email')}
          placeholder="you@example.com"
          error={errors.email}
          autoComplete="email"
        />
        <Input
          id="password"
          name="password"
          type="password"
          label={t('password')}
          placeholder="••••••••"
          error={errors.password}
          autoComplete="current-password"
        />
        <div className="flex justify-end">
          <Link
            href={localizeHref('/forgot-password', locale)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            {t('forgotPassword')}
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? `${t('signIn')}...` : t('signIn')}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600">
        {t('noAccount')}{' '}
        <Link href={localizeHref('/signup', locale)} className="font-medium text-blue-600 hover:underline">
          {t('signUp')}
        </Link>
      </p>
    </div>
  );
}
