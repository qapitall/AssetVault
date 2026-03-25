import { createClient } from '@/lib/supabase/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import { AssetForm } from '@/components/assets/asset-form';

export const metadata = {
  title: 'New Asset - AssetVault',
};

export default async function NewAssetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeStr } = await params;
  const locale = localeStr as Locale;
  setRequestLocale(locale);
  const t = await getTranslations('assets');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: platforms }, { data: tags }] = await Promise.all([
    supabase
      .from('platforms')
      .select('*')
      .eq('user_id', user.id)
      .order('platform_name'),
    supabase
      .from('tags')
      .select('*')
      .or(`user_id.eq.${user.id},is_default.eq.true`)
      .order('name'),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('create.title')}</h1>
        <p className="text-sm text-gray-500">{t('create.subtitle')}</p>
      </div>

      <AssetForm platforms={platforms || []} tags={tags || []} />
    </div>
  );
}
