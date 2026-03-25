'use client';

import { useTranslations } from 'next-intl';
import { LogoutButton } from '@/components/auth/logout-button';
import { Avatar } from '@/components/ui/avatar';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { useUser } from '@/hooks/use-user';

export function UserMenu() {
  const { profile } = useUser();
  const t = useTranslations('layout.userMenu');

  return (
    <DropdownMenu
      trigger={
        <button className="flex items-center gap-2">
          <Avatar
            src={profile?.avatar_url}
            fallback={profile?.full_name || profile?.email}
            size="sm"
          />
          <span className="hidden text-sm font-medium text-gray-700 md:block">
            {profile?.full_name || profile?.email || t('user')}
          </span>
        </button>
      }
    >
      <div className="border-b border-gray-100 px-3 py-2">
        <p className="text-sm font-medium text-gray-900">
          {profile?.full_name || t('user')}
        </p>
        <p className="text-xs text-gray-500">{profile?.email}</p>
      </div>
      <div className="border-t border-gray-100">
        <LogoutButton />
      </div>
    </DropdownMenu>
  );
}
