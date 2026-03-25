import { setRequestLocale } from 'next-intl/server';
import { MobileNav } from '@/components/layout/mobile-nav';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MobileNav>{children}</MobileNav>;
}
