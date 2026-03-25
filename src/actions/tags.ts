'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseFriendlyError } from '@/lib/supabase/errors';
import { ensureUserBootstrap } from '@/lib/supabase/bootstrap-user';
import { tagSchema } from '@/lib/validations';
import type { ActionResponse, Tag } from '@/types';

export async function createTag(data: { name: string }): Promise<ActionResponse<Tag>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const parsed = tagSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const bootstrap = await ensureUserBootstrap(user);
  if (!bootstrap.success) {
    return { success: false, error: bootstrap.error };
  }

  const { data: tag, error } = await supabase
    .from('tags')
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      is_default: false,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'A tag with this name already exists.' };
    }
    return { success: false, error: getSupabaseFriendlyError(error.message, error.code) };
  }

  revalidatePath('/tags');
  return { success: true, data: tag };
}

export async function updateTag(
  tagId: string,
  data: { name: string }
): Promise<ActionResponse<Tag>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const parsed = tagSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { data: tag, error } = await supabase
    .from('tags')
    .update({ name: parsed.data.name })
    .eq('id', tagId)
    .eq('user_id', user.id)
    .eq('is_default', false)
    .select()
    .single();

  if (error) {
    return { success: false, error: getSupabaseFriendlyError(error.message, error.code) };
  }

  revalidatePath('/tags');
  return { success: true, data: tag };
}

export async function deleteTag(tagId: string): Promise<ActionResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', tagId)
    .eq('user_id', user.id)
    .eq('is_default', false);

  if (error) {
    return { success: false, error: getSupabaseFriendlyError(error.message, error.code) };
  }

  revalidatePath('/tags');
  return { success: true };
}
