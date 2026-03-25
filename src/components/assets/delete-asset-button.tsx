'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/config';
import { localizeHref } from '@/lib/locale';
import { deleteAsset } from '@/actions/assets';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import { Trash2 } from 'lucide-react';

interface DeleteAssetButtonProps {
  assetId: string;
  assetTitle: string;
}

export function DeleteAssetButton({ assetId, assetTitle }: DeleteAssetButtonProps) {
  const router = useRouter();
  const locale = useLocale() as Locale;
  const t = useTranslations('assets');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const result = await deleteAsset(assetId);
    if (result.success) {
      toast(t('messages.deleted'), 'success');
      router.push(localizeHref('/assets', locale));
    } else {
      toast(result.error || t('messages.deleteFailed'), 'error');
    }
    setLoading(false);
    setOpen(false);
  }

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="mr-1 h-4 w-4" />
        {t('detail.delete')}
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} title={t('detail.deleteTitle')}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {t('detail.confirmDeletePrefix')} <strong>{assetTitle}</strong>? {t('detail.confirmDeleteSuffix')}
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('form.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? t('detail.deleting') : t('detail.deleteConfirm')}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
