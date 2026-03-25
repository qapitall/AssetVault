'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { deletePlatform } from '@/actions/platforms';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlatformForm } from './platform-form';
import { toast } from '@/components/ui/toast';
import { Globe, Pencil, Trash2, ExternalLink } from 'lucide-react';
import type { Platform } from '@/types';

interface PlatformListProps {
  platforms: Platform[];
}

export function PlatformList({ platforms }: PlatformListProps) {
  const t = useTranslations('platforms');
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleDelete(platformId: string) {
    const result = await deletePlatform(platformId);
    if (result.success) {
      toast(t('messages.deleted'), 'success');
    } else {
      toast(result.error || t('messages.saveFailed'), 'error');
    }
  }

  if (platforms.length === 0) {
    return (
      <div className="py-12 text-center">
        <Globe className="mx-auto h-8 w-8 text-gray-300" />
        <p className="mt-2 text-gray-500">{t('empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {platforms.map((platform) => (
        <Card key={platform.id}>
          <CardContent className="py-4">
            {editingId === platform.id ? (
              <PlatformForm
                platform={platform}
                onSuccess={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gray-100 p-2">
                    <Globe className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {platform.platform_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {platform.account_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {platform.platform_url && (
                    <a
                      href={platform.platform_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(platform.id)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(platform.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
