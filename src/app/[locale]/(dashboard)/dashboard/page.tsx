import { createClient } from '@/lib/supabase/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Package, Globe, Tags } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { localizeHref } from '@/lib/locale';
import { formatDate } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'dashboard' });

  return {
    title: `${t('title')} - AssetVault`,
  };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeStr } = await params;
  const locale = localeStr as Locale;
  setRequestLocale(locale);
  const supabase = await createClient();
  const t = await getTranslations({ locale, namespace: 'dashboard' });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const [
    { count: assetCount },
    { count: platformCount },
    { count: tagCount },
    { data: recentAssets },
  ] = await Promise.all([
    supabase.from('assets').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('platforms').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('tags').select('id', { count: 'exact', head: true }).or(`user_id.eq.${user.id},is_default.eq.true`),
    supabase.from('assets').select('id, title, created_at, platforms(platform_name)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-sm text-gray-500">{t('subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="rounded-lg bg-blue-50 p-2.5">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('stats.totalAssets')}</p>
              <p className="text-2xl font-bold text-gray-900">{assetCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="rounded-lg bg-green-50 p-2.5">
              <Globe className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('stats.platforms')}</p>
              <p className="text-2xl font-bold text-gray-900">{platformCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="rounded-lg bg-purple-50 p-2.5">
              <Tags className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('stats.tags')}</p>
              <p className="text-2xl font-bold text-gray-900">{tagCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{t('recentAssets.title')}</h2>
            <Link href={localizeHref('/assets', locale)}>
              <Button variant="ghost" size="sm">{t('recentAssets.viewAll')}</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentAssets && recentAssets.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {recentAssets.map((asset) => (
                <Link
                  key={asset.id}
                  href={localizeHref(`/assets/${asset.id}`, locale)}
                  className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-6 px-6 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{asset.title}</p>
                    <p className="text-sm text-gray-500">
                      {(asset.platforms as { platform_name: string } | null)?.platform_name || t('recentAssets.noPlatform')}
                    </p>
                  </div>
                  <p className="text-sm text-gray-400">
                    {formatDate(asset.created_at, locale)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500">{t('recentAssets.noAssets')}</p>
              <Link href={localizeHref('/assets/new', locale)}>
                <Button variant="outline" size="sm" className="mt-2">
                  {t('recentAssets.addFirst')}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
