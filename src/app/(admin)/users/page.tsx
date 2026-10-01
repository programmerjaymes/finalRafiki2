import React from 'react';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import UserList from '@/components/admin/users/UserList';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import { cookies } from 'next/headers';
import { t } from '@/lib/i18n';

const UsersPage = async () => {
  const locale = (await cookies()).get('rafiki_locale')?.value === 'sw' ? 'sw' : 'en';
  const messages = t(locale);

  return (
    <div>
      <PageBreadcrumb
        items={[
          { label: messages.admin.dashboard, path: '/dashboard' },
          { label: messages.admin.users },
        ]}
      />

      <div className="mt-4 space-y-7">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-blue-500 px-6 py-7 text-white shadow-lg sm:px-8">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
          <div className="absolute -bottom-24 right-28 h-48 w-48 rounded-full bg-white/5" />
          <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-white/70">Administration</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">{messages.admin.usersManagement}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">{messages.admin.usersSubtitle}</p>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-inner backdrop-blur-sm">
              <UserGroupIcon className="h-8 w-8" />
            </div>
          </div>
        </section>

        <UserList />
      </div>
    </div>
  );
};

export default UsersPage;
