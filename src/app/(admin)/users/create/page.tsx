'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserForm from '@/components/admin/users/UserForm';
import PageBreadcrumb from '@/components/PageBreadcrumb';

export default function CreateUserPage() {
  const router = useRouter();
  
  const handleBack = () => {
    router.push('/users');
  };
  
  return (
    <>
      <div className="mb-6">
        <PageBreadcrumb
          items={[
            { label: 'Dashboard', path: '/' },
            { label: 'Users', path: '/users' },
            { label: 'Create User' },
          ]}
        />
      </div>
      
      <UserForm onBack={handleBack} />
    </>
  );
} 