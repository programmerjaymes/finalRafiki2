import React from 'react';
import UserList from '@/components/admin/users/UserList';
import PageBreadcrumb from '@/components/PageBreadcrumb';

const UsersPage = () => {
  return (
    <div>
      <PageBreadcrumb
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Users' },
        ]}
      />
      
      <div className="mt-4">
        <h1 className="text-2xl font-bold mb-6">Users Management</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Manage user accounts, roles, and permissions.
        </p>
        <UserList />
      </div>
    </div>
  );
};

export default UsersPage;
