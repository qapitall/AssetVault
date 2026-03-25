'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseFriendlyError } from '@/lib/supabase/errors';
import { ensureUserBootstrap } from '@/lib/supabase/bootstrap-user';
import { assetSchema } from '@/lib/validations';
import type { ActionResponse, Asset } from '@/types';

export async function createAsset(data: {
  title: string;
  platformId?: string;
  purchaseUrl?: string;
  notes?: string;
  tagIds?: string[];
  previewImagePath?: string;
}): Promise<ActionResponse<Asset>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const parsed = assetSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const bootstrap = await ensureUserBootstrap(user);
  if (!bootstrap.success) {
    return { success: false, error: bootstrap.error };
  }

  // Create asset + tags in a single transaction via RPC
  const { data: asset, error } = await supabase.rpc('create_asset_with_tags', {
    p_title: parsed.data.title,
    p_platform_id: parsed.data.platformId || null,
    p_purchase_url: parsed.data.purchaseUrl || null,
    p_notes: parsed.data.notes || null,
    p_preview_image_path: data.previewImagePath || null,
    p_tag_ids: data.tagIds || [],
  }).single();

  if (error) {
    return { success: false, error: getSupabaseFriendlyError(error.message, error.code) };
  }

  revalidatePath('/assets');
  revalidatePath('/dashboard');
  return { success: true, data: asset };
}

export async function updateAsset(
  assetId: string,
  data: {
    title?: string;
    platformId?: string;
    purchaseUrl?: string;
    notes?: string;
    tagIds?: string[];
    previewImagePath?: string;
  }
): Promise<ActionResponse<Asset>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const parsed = assetSchema.partial().safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Update asset + tags in a single transaction via RPC
  const { data: asset, error } = await supabase.rpc('update_asset_with_tags', {
    p_asset_id: assetId,
    p_title: parsed.data.title ?? null,
    p_platform_id: parsed.data.platformId !== undefined ? (parsed.data.platformId || null) : null,
    p_purchase_url: parsed.data.purchaseUrl !== undefined ? (parsed.data.purchaseUrl || null) : null,
    p_notes: parsed.data.notes !== undefined ? (parsed.data.notes || null) : null,
    p_preview_image_path: data.previewImagePath !== undefined ? data.previewImagePath : null,
    p_tag_ids: parsed.data.tagIds !== undefined ? parsed.data.tagIds : null,
  }).single();

  if (error) {
    return { success: false, error: getSupabaseFriendlyError(error.message, error.code) };
  }

  revalidatePath('/assets');
  revalidatePath(`/assets/${assetId}`);
  revalidatePath('/dashboard');
  return { success: true, data: asset };
}

export async function deleteAsset(assetId: string): Promise<ActionResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data: asset } = await supabase
    .from('assets')
    .select('preview_image_path')
    .eq('id', assetId)
    .eq('user_id', user.id)
    .single();

  if (asset?.preview_image_path) {
    await supabase.storage
      .from('asset-previews')
      .remove([asset.preview_image_path]);
  }

  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', assetId)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: getSupabaseFriendlyError(error.message, error.code) };
  }

  revalidatePath('/assets');
  revalidatePath('/dashboard');
  return { success: true };
}
