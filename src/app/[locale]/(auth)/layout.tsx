import { LandingNavbar } from '@/components/layout/landing-navbar';

interface AuthLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AuthLayout({ children, params }: AuthLayoutProps) {
  const { locale } = await params;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <LandingNavbar locale={locale} />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-blue-100 bg-white p-8 shadow-lg shadow-blue-100/30">
          {children}
        </div>
      </div>
    </div>
  );
}
