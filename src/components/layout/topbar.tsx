import { Suspense } from 'react';
import { Menu } from 'lucide-react';
import { LanguageSwitcher } from './language-switcher';
import { UserMenu } from './user-menu';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="flex h-16 items-center border-b border-gray-200 bg-white px-6">
      <button onClick={onMenuClick} className="lg:hidden">
        <Menu className="h-5 w-5 text-gray-600" />
      </button>
      <div className="ml-auto flex items-center gap-3">
        <Suspense fallback={null}>
          <LanguageSwitcher />
        </Suspense>
        <UserMenu />
      </div>
    </header>
  );
}
