import React from 'react';
import UserDetail from '@/components/admin/users/UserDetail';
import PageBreadcrumb from '@/components/PageBreadcrumb';

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  
  return (
    <>
      <div className="mb-6">
        <PageBreadcrumb
          items={[
            { label: 'Dashboard', path: '/' },
            { label: 'Users', path: '/users' },
            { label: 'User Details' },
          ]}
        />
      </div>
      
      <UserDetail userId={id} />
    </>
  );
} 