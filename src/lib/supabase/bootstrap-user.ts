import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseFriendlyError } from '@/lib/supabase/errors';

type BootstrapResult =
  | { success: true }
  | { success: false; error: string };

export async function ensureUserBootstrap(user: User): Promise<BootstrapResult> {
  const supabase = await createClient();

  // Call SECURITY DEFINER function that bypasses RLS
  const { error } = await supabase.rpc('ensure_user_profile', {
    p_user_id: user.id,
    p_email: user.email ?? `${user.id}@no-email.local`,
  });

  if (error) {
    console.error('[bootstrap] ensure_user_profile failed:', error.code, error.message);
    return {
      success: false,
      error: getSupabaseFriendlyError(error.message, error.code),
    };
  }

  return { success: true };
}
