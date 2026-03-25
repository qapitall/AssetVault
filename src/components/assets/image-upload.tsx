'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getSupabasePublicUrl } from '@/lib/utils';
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/lib/constants';
import { Upload, X } from 'lucide-react';
import { toast } from '@/components/ui/toast';

interface ImageUploadProps {
  currentImage?: string | null;
  onFileSelect: (file: File | null) => void;
}

export function ImageUpload({ currentImage, onFileSelect }: ImageUploadProps) {
  const t = useTranslations('assets');
  const [preview, setPreview] = useState<string | null>(
    currentImage ? getSupabasePublicUrl(currentImage) : null
  );
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast(t('upload.invalidFileType'), 'error');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast(t('upload.fileTooLarge'), 'error');
      return;
    }

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }

    const url = URL.createObjectURL(file);
    blobUrlRef.current = url;
    setPreview(url);
    onFileSelect(file);
  }

  function handleRemove() {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setPreview(null);
    onFileSelect(null);
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {t('upload.label')}
      </label>
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt={t('upload.previewAlt')}
            className="h-40 w-40 rounded-lg border border-gray-200 object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 rounded-full bg-white p-1 shadow-md hover:bg-gray-50"
          >
            <X className="h-3.5 w-3.5 text-gray-500" />
          </button>
        </div>
      ) : (
        <label className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
          <Upload className="h-6 w-6 text-gray-400" />
          <span className="mt-2 text-xs text-gray-500">{t('upload.button')}</span>
          <input
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
