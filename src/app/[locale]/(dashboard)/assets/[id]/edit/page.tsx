import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import { createClient } from '@/lib/supabase/server';
import { AssetForm } from '@/components/assets/asset-form';

interface EditAssetPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: EditAssetPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: asset } = await supabase
    .from('assets')
    .select('title')
    .eq('id', id)
    .single();

  return {
    title: asset ? `Edit ${asset.title} - AssetVault` : 'Asset Not Found',
  };
}

export default async function EditAssetPage({ params }: EditAssetPageProps) {
  const { id, locale: localeStr } = await params;
  const locale = localeStr as Locale;
  setRequestLocale(locale);
  const t = await getTranslations('assets');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const [
    { data: asset },
    { data: platforms },
    { data: tags },
    { data: assetTags },
  ] = await Promise.all([
    supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),
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
    supabase
      .from('asset_tags')
      .select('tag_id')
      .eq('asset_id', id),
  ]);

  if (!asset) notFound();

  const tagIds = assetTags?.map((at) => at.tag_id) || [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('edit.title')}</h1>
        <p className="text-sm text-gray-500">{t('edit.subtitle')}</p>
      </div>

      <AssetForm
        asset={{ ...asset, tagIds }}
        platforms={platforms || []}
        tags={tags || []}
      />
    </div>
  );
}
