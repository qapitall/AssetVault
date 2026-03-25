'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import type { Tag } from '@/types';

interface AssetFiltersProps {
  tags: Tag[];
}

export function AssetFilters({ tags }: AssetFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('assets.filters');
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(search, 300);
  const activeTag = searchParams.get('tag');

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });
      return newParams.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    const query = createQueryString({
      search: debouncedSearch || null,
    });
    const href = query ? `${pathname}?${query}` : pathname;
    const current = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

    if (href !== current) {
      router.replace(href);
    }
  }, [debouncedSearch, pathname, router, createQueryString]);

  function handleTagFilter(tagId: string) {
    const query = createQueryString({
      tag: activeTag === tagId ? null : tagId,
    });
    router.push(`${pathname}?${query}`);
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="pl-9"
        />
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleTagFilter(tag.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeTag === tag.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
