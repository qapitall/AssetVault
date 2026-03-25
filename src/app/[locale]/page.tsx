import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { LandingNavbar } from '@/components/layout/landing-navbar';
import { Package, Globe, Tags, Shield, Github, FolderOpen, Layers } from 'lucide-react';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });

  const features = [
    { key: 'catalog', icon: Package },
    { key: 'multiPlatform', icon: Globe },
    { key: 'smartTags', icon: Tags },
    { key: 'secure', icon: Shield },
  ] as const;

  const exampleAssets = [
    { key: 'buildings', tags: ['threeDModel', 'environment'] },
    { key: 'system', tags: ['scripts', 'gameplay'] },
    { key: 'sfx', tags: ['audio', 'sfx'] },
    { key: 'ui', tags: ['ui', 'texture'] },
    { key: 'animals', tags: ['threeDModel', 'environment'] },
  ] as const;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-white via-blue-50 to-purple-50 text-gray-900">
      <LandingNavbar locale={locale} />

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-24 text-center lg:py-32">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm text-blue-700">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-600" />
            {t('badge')}
          </div>
          <h1 className="mt-8 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            {t('hero.title.line1')}
            <br />
            {t('hero.title.line2')}
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('hero.title.highlight')}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
            {t('hero.description')}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={`/${locale}/signup`}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-200">
                {t('hero.cta')}
              </Button>
            </Link>
            <a
              href="https://github.com/YOUR_USERNAME/assetvault"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                <Github className="mr-2 h-4 w-4" />
                {t('hero.github')}
              </Button>
            </a>
          </div>
        </section>

        <section className="border-t border-blue-100/50 bg-gradient-to-b from-blue-50/50 to-white py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-3xl font-bold text-gray-900">
              {t('features.title')}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-gray-600">
              {t('features.subtitle')}
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.key}
                  className="rounded-xl border border-blue-100 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100"
                >
                  <div className="mb-4 inline-flex rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 p-2.5">
                    <feature.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{t(`features.items.${feature.key}.title`)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {t(`features.items.${feature.key}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-blue-100/50 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {t('useCase.title')}
                </h2>
                <p className="mt-4 leading-relaxed text-gray-600">
                  {t('useCase.example')}
                </p>
                <p className="mt-3 leading-relaxed text-gray-600">
                  {t('useCase.problem')}
                </p>
              </div>

              <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-lg shadow-blue-100/30">
                <div className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-900">
                  <FolderOpen className="h-4 w-4 text-blue-600" />
                  {t('useCase.libraryTitle')}
                </div>
                <div className="space-y-3">
                  {exampleAssets.map((asset) => (
                    <div
                      key={asset.key}
                      className="flex items-start justify-between rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50/50 to-white px-4 py-3"
                    >
                      <div className="flex items-start gap-3">
                        <Layers className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {t(`useCase.exampleAssets.${asset.key}.title`)}
                          </p>
                          <p className="text-xs text-gray-500">{t(`useCase.exampleAssets.${asset.key}.platform`)}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1.5">
                        {asset.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-2 py-0.5 text-xs text-blue-700"
                          >
                            {t(`useCase.tags.${tag}`)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-blue-100/50 bg-gradient-to-b from-white to-blue-50/50 py-20">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              {t('cta.title')}
            </h2>
            <p className="mt-3 text-gray-600">
              {t('cta.description')}
            </p>
            <Link href={`/${locale}/signup`}>
              <Button size="lg" className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-200">
                {t('cta.button')}
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-blue-100/50 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} AssetVault. {t('badge')}
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/YOUR_USERNAME/assetvault"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 transition-colors hover:text-blue-600"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
