import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { defaultLocale, isValidLocale } from '@/i18n/config';

export default async function RootPage() {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = isValidLocale(localeCookie) ? localeCookie : defaultLocale;
  redirect(`/${locale}`);
}
