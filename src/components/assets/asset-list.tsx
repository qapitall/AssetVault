import { AssetCard } from './asset-card';
import { useTranslations } from 'next-intl';
import type { AssetWithTags } from '@/types';

interface AssetListProps {
  assets: AssetWithTags[];
}

export function AssetList({ assets }: AssetListProps) {
  const t = useTranslations('assets');
  if (assets.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">{t('noAssets')}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  );
}
