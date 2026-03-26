import React from 'react';
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
      
      <div className="mt-4">
        <h1 className="text-2xl font-bold mb-6">{messages.admin.usersManagement}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          {messages.admin.usersSubtitle}
        </p>
        <UserList />
      </div>
    </div>
  );
};

export default UsersPage;
