import { Suspense } from 'react';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import type { Locale } from '@/i18n/config';
import { createClient } from '@/lib/supabase/server';
import { AssetList } from '@/components/assets/asset-list';
import { AssetFilters } from '@/components/assets/asset-filters';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { ITEMS_PER_PAGE } from '@/lib/constants';
import { localizeHref } from '@/lib/locale';
import { escapeLikePattern } from '@/lib/utils';
import type { AssetWithTags, Tag } from '@/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'assets' });

  return {
    title: `${t('title')} - AssetVault`,
  };
}

interface AssetsPageProps {
  searchParams: Promise<{ search?: string; tag?: string; page?: string }>;
}

export default async function AssetsPage({
  searchParams,
  params: localeParams,
}: AssetsPageProps & { params: Promise<{ locale: string }> }) {
  const params = await searchParams;
  const { locale: localeStr } = await localeParams;
  const locale = localeStr as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'assets' });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const offset = (page - 1) * ITEMS_PER_PAGE;

  // Fetch tags for filter
  const { data: tags } = await supabase
    .from('tags')
    .select('id, user_id, name, is_default, created_at')
    .or(`user_id.eq.${user.id},is_default.eq.true`)
    .order('name');

  let filteredAssetIds: string[] | null = null;
  if (params.tag) {
    const { data: matchingAssetTags } = await supabase
      .from('asset_tags')
      .select('asset_id')
      .eq('tag_id', params.tag);

    filteredAssetIds = Array.from(new Set((matchingAssetTags || []).map((row) => row.asset_id)));
  }

  // Build assets query
  let assetsQuery = supabase
    .from('assets')
    .select('id, user_id, platform_id, title, purchase_url, preview_image_path, notes, created_at, updated_at, platforms(id, user_id, platform_name, account_name, platform_url, created_at, updated_at)', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1);

  if (params.search) {
    const search = params.search.slice(0, 200);
    const escaped = escapeLikePattern(search);
    assetsQuery = assetsQuery.ilike('title', `%${escaped}%`);
  }

  if (filteredAssetIds) {
    if (filteredAssetIds.length === 0) {
      assetsQuery = assetsQuery.in('id', ['00000000-0000-0000-0000-000000000000']);
    } else {
      assetsQuery = assetsQuery.in('id', filteredAssetIds);
    }
  }

  const { data: assets, count } = await assetsQuery;

  // Get tags for each asset
  let filteredAssets: AssetWithTags[] = [];
  if (assets) {
    const assetIds = assets.map((a) => a.id);
    const { data: assetTags } = await supabase
      .from('asset_tags')
      .select('asset_id, tags(id, user_id, name, is_default, created_at)')
      .in('asset_id', assetIds);

    const tagsByAssetId = new Map<string, Tag[]>();
    for (const entry of assetTags || []) {
      const tag = entry.tags as unknown as Tag | null;
      if (!tag) continue;

      const existing = tagsByAssetId.get(entry.asset_id);
      if (existing) {
        existing.push(tag);
      } else {
        tagsByAssetId.set(entry.asset_id, [tag]);
      }
    }

    filteredAssets = assets.map((asset) => {
      return {
        ...asset,
        tags: tagsByAssetId.get(asset.id) || [],
        platform: asset.platforms as unknown as AssetWithTags['platform'],
      };
    });
  }

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-gray-500">{t('summary', {count: count ?? 0})}</p>
        </div>
        <Link href={localizeHref('/assets/new', locale)}>
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            {t('create.newBtn')}
          </Button>
        </Link>
      </div>

      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <AssetFilters tags={tags || []} />
      </Suspense>

      <AssetList assets={filteredAssets} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={localizeHref(`/assets?page=${page - 1}${params.search ? `&search=${params.search}` : ''}${params.tag ? `&tag=${params.tag}` : ''}`, locale)}>
              <Button variant="outline" size="sm">{t('pagination.previous')}</Button>
            </Link>
          )}
          <span className="text-sm text-gray-500">
            {t('pagination.pageOf', {page, totalPages})}
          </span>
          {page < totalPages && (
            <Link href={localizeHref(`/assets?page=${page + 1}${params.search ? `&search=${params.search}` : ''}${params.tag ? `&tag=${params.tag}` : ''}`, locale)}>
              <Button variant="outline" size="sm">{t('pagination.next')}</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
