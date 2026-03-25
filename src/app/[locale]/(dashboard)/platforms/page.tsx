import { createClient } from '@/lib/supabase/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import type { Locale } from '@/i18n/config';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PlatformForm } from '@/components/platforms/platform-form';
import { PlatformList } from '@/components/platforms/platform-list';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'platforms' });

  return {
    title: `${t('title')} - AssetVault`,
  };
}

export default async function PlatformsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeStr } = await params;
  const locale = localeStr as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'platforms' });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: platforms } = await supabase
    .from('platforms')
    .select('*')
    .eq('user_id', user.id)
    .order('platform_name');

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-sm text-gray-500">{t('subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">{t('create.title')}</h2>
        </CardHeader>
        <CardContent>
          <PlatformForm />
        </CardContent>
      </Card>

      <PlatformList platforms={platforms || []} />
    </div>
  );
}
