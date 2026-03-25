import { type NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { defaultLocale, isValidLocale, locales } from '@/i18n/config';
import { updateSession } from '@/lib/supabase/middleware';
import { stripLocaleFromPath } from '@/lib/locale';
import { rateLimit } from '@/lib/rate-limit';

const publicRoutes = ['/login', '/signup', '/callback', '/forgot-password'];
const authRoutes = ['/login', '/signup'];
const rateLimitedPaths = ['/login', '/signup', '/forgot-password'];

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export async function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request);
  const { user, supabaseResponse } = await updateSession(request);
  const { pathname } = request.nextUrl;
  const localeSegment = pathname.split('/')[1];
  const locale = isValidLocale(localeSegment) ? localeSegment : defaultLocale;
  const pathToCheck = stripLocaleFromPath(pathname);

  // Rate limit auth endpoints (5 requests per minute per IP)
  if (rateLimitedPaths.some((route) => pathToCheck === route)) {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') ?? '127.0.0.1';
    const { success } = rateLimit(`auth:${ip}`, 5, 60_000);
    if (!success) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } }
      );
    }
  }

  // Redirect authenticated users away from auth pages
  if (user && authRoutes.some((route) => pathToCheck === route)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  if (!user && !publicRoutes.includes(pathToCheck) && pathToCheck !== '/') {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  supabaseResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'content-type') {
      intlResponse.headers.set(key, value);
    }
  });

  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie);
  });

  return intlResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
