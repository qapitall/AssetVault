'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/config';
import { localizeHref } from '@/lib/locale';
import { createAsset, updateAsset } from '@/actions/assets';
import { uploadPreviewImage } from '@/actions/upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { TagSelector } from '@/components/tags/tag-selector';
import { ImageUpload } from './image-upload';
import { toast } from '@/components/ui/toast';
import type { Asset, Platform, Tag } from '@/types';

interface AssetFormProps {
  asset?: Asset & { tagIds?: string[] };
  platforms: Platform[];
  tags: Tag[];
}

export function AssetForm({ asset, platforms, tags }: AssetFormProps) {
  const router = useRouter();
  const locale = useLocale() as Locale;
  const t = useTranslations('assets');
  const [loading, setLoading] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    asset?.tagIds || []
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  const isEditing = !!asset;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      platformId: (formData.get('platformId') as string) || undefined,
      purchaseUrl: (formData.get('purchaseUrl') as string) || undefined,
      notes: (formData.get('notes') as string) || undefined,
      tagIds: selectedTagIds,
    };

    if (isEditing) {
      let previewImagePath = asset.preview_image_path ?? undefined;

      if (imageFile) {
        const imgFormData = new FormData();
        imgFormData.set('file', imageFile);
        const uploadResult = await uploadPreviewImage(imgFormData);
        if (uploadResult.success && uploadResult.data) {
          previewImagePath = uploadResult.data.path;
        }
      }

      const result = await updateAsset(asset.id, {
        ...data,
        previewImagePath,
      });
      if (result.success) {
        toast(t('messages.updated'), 'success');
        router.push(localizeHref(`/assets/${asset.id}`, locale));
      } else {
        toast(result.error || t('messages.updateFailed'), 'error');
      }
    } else {
      const result = await createAsset(data);
      if (result.success && result.data) {
        if (imageFile) {
          const imgFormData = new FormData();
          imgFormData.set('file', imageFile);
          const uploadResult = await uploadPreviewImage(
            imgFormData
          );
          if (uploadResult.success && uploadResult.data) {
            await updateAsset(result.data.id, {
              previewImagePath: uploadResult.data.path,
            });
          }
        }
        toast(t('messages.created'), 'success');
        router.push(localizeHref('/assets', locale));
      } else {
        toast(result.error || t('messages.createFailed'), 'error');
      }
    }
    setLoading(false);
  }

  const platformOptions = platforms.map((p) => ({
    value: p.id,
    label: `${p.platform_name} (${p.account_name})`,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="title"
        name="title"
        label={t('form.title')}
        placeholder={t('form.titlePlaceholder')}
        defaultValue={asset?.title}
        required
      />

      <Select
        id="platformId"
        name="platformId"
        label={t('form.platform')}
        options={platformOptions}
        placeholder={t('form.selectPlatform')}
        defaultValue={asset?.platform_id || ''}
      />

      <Input
        id="purchaseUrl"
        name="purchaseUrl"
        label={t('form.purchaseUrl')}
        type="url"
        placeholder="https://..."
        defaultValue={asset?.purchase_url || ''}
      />

      <div className="space-y-1.5">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          {t('form.notes')}
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
          placeholder={t('form.notesPlaceholder')}
          defaultValue={asset?.notes || ''}
        />
      </div>

      <TagSelector
        availableTags={tags}
        selectedTagIds={selectedTagIds}
        onChange={setSelectedTagIds}
      />

      <ImageUpload
        currentImage={asset?.preview_image_path}
        onFileSelect={setImageFile}
      />

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading
            ? isEditing
              ? t('form.updating')
              : t('form.creating')
            : isEditing
            ? t('edit.submit')
            : t('create.submit')}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {t('form.cancel')}
        </Button>
      </div>
    </form>
  );
}
