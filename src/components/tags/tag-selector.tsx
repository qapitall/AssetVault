'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { Tag } from '@/types';
import { ChevronDown } from 'lucide-react';

interface TagSelectorProps {
  availableTags: Tag[];
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}

export function TagSelector({ availableTags, selectedTagIds, onChange }: TagSelectorProps) {
  const t = useTranslations('tags.selector');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedTags = availableTags.filter((t) => selectedTagIds.includes(t.id));

  function toggleTag(tagId: string) {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  }

  return (
    <div ref={ref} className="relative">
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('label')}</label>
      <div
        onClick={() => setOpen(!open)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(!open);
          }
        }}
        className="flex min-h-[40px] w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
      >
        <div className="flex flex-wrap gap-1">
          {selectedTags.length > 0 ? (
            selectedTags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700"
              >
                {tag.name}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTag(tag.id);
                  }}
                  className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-gray-300"
                >
                  ×
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-400">{t('placeholder')}</span>
          )}
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
      </div>

      {open && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {availableTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={cn(
                'flex w-full items-center px-3 py-2 text-sm transition-colors',
                selectedTagIds.includes(tag.id)
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <span
                className={cn(
                  'mr-2 flex h-4 w-4 items-center justify-center rounded border',
                  selectedTagIds.includes(tag.id)
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300'
                )}
              >
                {selectedTagIds.includes(tag.id) && '✓'}
              </span>
              {tag.name}
              {tag.is_default && (
                <span className="ml-auto text-xs text-gray-400">{t('default')}</span>
              )}
            </button>
          ))}
          {availableTags.length === 0 && (
            <p className="px-3 py-2 text-sm text-gray-500">{t('empty')}</p>
          )}
        </div>
      )}
    </div>
  );
}
