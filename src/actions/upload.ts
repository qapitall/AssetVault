'use server';

import { randomUUID } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseFriendlyError } from '@/lib/supabase/errors';
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/lib/constants';
import { sanitizeFilename } from '@/lib/utils';
import type { ActionResponse } from '@/types';

export async function uploadPreviewImage(
  formData: FormData
): Promise<ActionResponse<{ path: string }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const file = formData.get('file') as File;
  if (!file) {
    return { success: false, error: 'No file provided' };
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return { success: false, error: 'Invalid file type. Accepted: JPEG, PNG, WebP, GIF' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'File size must be less than 5MB' };
  }

  // Build the storage path with random token to prevent URL guessing
  const ext = sanitizeFilename(file.name).split('.').pop() || 'bin';
  const path = `${user.id}/${randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from('asset-previews')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    return { success: false, error: getSupabaseFriendlyError(error.message) };
  }

  return { success: true, data: { path } };
}

export async function deletePreviewImage(path: string): Promise<ActionResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Verify the path belongs to the user; reject path traversal attempts
  const segments = path.split('/');
  if (segments[0] !== user.id || path.includes('..')) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase.storage
    .from('asset-previews')
    .remove([path]);

  if (error) {
    return { success: false, error: getSupabaseFriendlyError(error.message) };
  }

  return { success: true };
}
