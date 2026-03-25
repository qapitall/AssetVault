'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createPlatform, updatePlatform } from '@/actions/platforms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { DEFAULT_PLATFORM_OPTIONS } from '@/lib/constants';
import type { Platform } from '@/types';

interface PlatformFormProps {
  platform?: Platform;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PlatformForm({ platform, onSuccess, onCancel }: PlatformFormProps) {
  const t = useTranslations('platforms');
  const [loading, setLoading] = useState(false);
  const isEditing = !!platform;

  const platformOptions = DEFAULT_PLATFORM_OPTIONS.map((name) => ({
    value: name,
    label: name,
  }));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      platformName: formData.get('platformName') as string,
      accountName: formData.get('accountName') as string,
      platformUrl: (formData.get('platformUrl') as string) || undefined,
    };

    const result = isEditing
      ? await updatePlatform(platform.id, data)
      : await createPlatform(data);

    if (result.success) {
      toast(isEditing ? t('messages.updated') : t('messages.created'), 'success');
      onSuccess?.();
    } else {
      toast(result.error || t('messages.saveFailed'), 'error');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        id="platformName"
        name="platformName"
        label={t('form.name')}
        options={platformOptions}
        placeholder={t('form.select')}
        defaultValue={platform?.platform_name || ''}
        required
      />
      <Input
        id="accountName"
        name="accountName"
        label={t('form.account')}
        placeholder={t('form.accountPlaceholder')}
        defaultValue={platform?.account_name || ''}
        required
      />
      <Input
        id="platformUrl"
        name="platformUrl"
        label={t('form.url')}
        type="url"
        placeholder="https://..."
        defaultValue={platform?.platform_url || ''}
      />
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? t('form.saving') : isEditing ? t('form.update') : t('create.newBtn')}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('form.cancel')}
          </Button>
        )}
      </div>
    </form>
  );
}
