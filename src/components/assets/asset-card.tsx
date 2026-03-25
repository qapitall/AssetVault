'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { TagBadge } from '@/components/tags/tag-badge';
import { Package } from 'lucide-react';
import { getLocaleFromPath, localizeHref } from '@/lib/locale';
import { getSupabasePublicUrl } from '@/lib/utils';
import type { AssetWithTags } from '@/types';

interface AssetCardProps {
  asset: AssetWithTags;
}

export function AssetCard({ asset }: AssetCardProps) {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const imageUrl = asset.preview_image_path
    ? getSupabasePublicUrl(asset.preview_image_path)
    : null;

  return (
    <Link href={localizeHref(`/assets/${asset.id}`, locale)}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-md">
        <div className="aspect-video w-full bg-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={asset.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-8 w-8 text-gray-300" />
            </div>
          )}
        </div>
        <CardContent className="py-3">
          <h3 className="font-medium text-gray-900 group-hover:text-gray-700 truncate">
            {asset.title}
          </h3>
          {asset.platform && (
            <p className="mt-0.5 text-xs text-gray-500">
              {asset.platform.platform_name}
            </p>
          )}
          {asset.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {asset.tags.slice(0, 3).map((tag) => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
              {asset.tags.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{asset.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
