'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { signUp } from '@/actions/auth';
import { signupSchema, type SignupInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import type { Locale } from '@/i18n/config';
import { localizeHref } from '@/lib/locale';
export function SignupForm() {
  const locale = useLocale() as Locale;
  const t = useTranslations('auth.signup');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof SignupInput, string>>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      fullName: formData.get('fullName') as string || undefined,
    };

    const result = signupSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof SignupInput;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    const response = await signUp(data);
    if (response.success) {
      toast(t('success'), 'success');
      window.location.href = localizeHref('/login', locale);
      return;
    } else {
      toast(response.error || t('error'), 'error');
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

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
        <p className="font-medium">{t('verification.title')}</p>
        <p className="mt-1 text-xs text-blue-700">
          {t('verification.description')}
        </p>
      </div>

      <form onSubmit={handleSubmit} method="POST" className="space-y-4">
        <Input
          id="fullName"
          name="fullName"
          type="text"
          label={t('fullName')}
          placeholder="John Doe"
          error={errors.fullName}
          autoComplete="name"
        />
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
          autoComplete="new-password"
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? `${t('createAccount')}...` : t('createAccount')}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600">
        {t('haveAccount')}{' '}
        <Link href={localizeHref('/login', locale)} className="font-medium text-blue-600 hover:underline">
          {t('signIn')}
        </Link>
      </p>
    </div>
  );
}
