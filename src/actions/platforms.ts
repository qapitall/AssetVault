'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseFriendlyError } from '@/lib/supabase/errors';
import { ensureUserBootstrap } from '@/lib/supabase/bootstrap-user';
import { platformSchema } from '@/lib/validations';
import type { ActionResponse, Platform } from '@/types';

export async function createPlatform(data: {
  platformName: string;
  accountName: string;
  platformUrl?: string;
}): Promise<ActionResponse<Platform>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const parsed = platformSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const bootstrap = await ensureUserBootstrap(user);
  if (!bootstrap.success) {
    return { success: false, error: bootstrap.error };
  }

  const { data: platform, error } = await supabase
    .from('platforms')
    .insert({
      user_id: user.id,
      platform_name: parsed.data.platformName,
      account_name: parsed.data.accountName,
      platform_url: parsed.data.platformUrl || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'This platform and account combination already exists.' };
    }
    return { success: false, error: getSupabaseFriendlyError(error.message, error.code) };
  }

  revalidatePath('/platforms');
  return { success: true, data: platform };
}

export async function updatePlatform(
  platformId: string,
  data: {
    platformName?: string;
    accountName?: string;
    platformUrl?: string;
  }
): Promise<ActionResponse<Platform>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const parsed = platformSchema.partial().safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const updateData: Record<string, unknown> = {};
  if (data.platformName !== undefined) updateData.platform_name = data.platformName;
  if (data.accountName !== undefined) updateData.account_name = data.accountName;
  if (data.platformUrl !== undefined) updateData.platform_url = data.platformUrl || null;

  const { data: platform, error } = await supabase
    .from('platforms')
    .update(updateData)
    .eq('id', platformId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return { success: false, error: getSupabaseFriendlyError(error.message, error.code) };
  }

  revalidatePath('/platforms');
  return { success: true, data: platform };
}

export async function deletePlatform(platformId: string): Promise<ActionResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('platforms')
    .delete()
    .eq('id', platformId)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: getSupabaseFriendlyError(error.message, error.code) };
  }

  revalidatePath('/platforms');
  return { success: true };
}
