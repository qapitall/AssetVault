import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Use the configured app URL instead of request origin to prevent open-redirect
  // via a manipulated Host header from a reverse proxy.
  const origin = process.env.NEXT_PUBLIC_APP_URL!;
  const code = searchParams.get('code');
  const type = searchParams.get('type');

  if (code && type === 'recovery') {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}/settings`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
