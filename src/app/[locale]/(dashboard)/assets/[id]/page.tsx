import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeleteAssetButton } from '@/components/assets/delete-asset-button';
import { TagBadge } from '@/components/tags/tag-badge';
import { localizeHref } from '@/lib/locale';
import { getSupabasePublicUrl, formatDate } from '@/lib/utils';
import { Pencil, ExternalLink, Package } from 'lucide-react';
import type { Tag } from '@/types';

interface AssetDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: AssetDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: asset } = await supabase
    .from('assets')
    .select('title')
    .eq('id', id)
    .single();

  return {
    title: asset ? `${asset.title} - AssetVault` : 'Asset Not Found',
  };
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const { id, locale: localeStr } = await params;
  const locale = localeStr as Locale;
  setRequestLocale(locale);
  const t = await getTranslations('assets');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: asset } = await supabase
    .from('assets')
    .select('*, platforms(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!asset) notFound();

  const { data: assetTags } = await supabase
    .from('asset_tags')
    .select('tags(*)')
    .eq('asset_id', id);

  const tags = (assetTags?.map((at) => at.tags).filter(Boolean) || []) as Tag[];
  const platform = asset.platforms as { platform_name: string; account_name: string } | null;
  const imageUrl = asset.preview_image_path
    ? getSupabasePublicUrl(asset.preview_image_path)
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{asset.title}</h1>
          <p className="text-sm text-gray-500">
            {t('detail.addedOn', {date: formatDate(asset.created_at)})}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={localizeHref(`/assets/${id}/edit`, locale)}>
            <Button variant="outline" size="sm">
              <Pencil className="mr-1 h-4 w-4" />
              {t('detail.edit')}
            </Button>
          </Link>
          <DeleteAssetButton assetId={id} assetTitle={asset.title} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="aspect-square w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={asset.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="h-12 w-12 text-gray-300" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 md:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900">{t('detail.details')}</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {platform && (
                <div>
                  <span className="text-sm text-gray-500">{t('form.platform')}:</span>
                  <p className="text-sm text-gray-900">
                    {platform.platform_name} ({platform.account_name})
                  </p>
                </div>
              )}

              {asset.purchase_url && (
                <div>
                  <span className="text-sm text-gray-500">{t('form.purchaseUrl')}:</span>
                  <a
                    href={asset.purchase_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    {asset.purchase_url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {tags.length > 0 && (
                <div>
                  <span className="text-sm text-gray-500">{t('form.tags')}:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <TagBadge key={tag.id} tag={tag} />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {asset.notes && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-gray-900">{t('form.notes')}</h2>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-gray-700">
                  {asset.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
