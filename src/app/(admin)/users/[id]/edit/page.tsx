'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import UserForm from '@/components/admin/users/UserForm';
import PageBreadcrumb from '@/components/PageBreadcrumb';

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const router = useRouter();
  const { id } = use(params);
  
  // Suppress the warning for now, future versions may require a different pattern
  
  const handleBack = () => {
    router.push(`/users/${id}`);
  };
  
  return (
    <>
      <div className="mb-6">
        <PageBreadcrumb
          items={[
            { label: 'Dashboard', path: '/' },
            { label: 'Users', path: '/users' },
            { label: 'User Details', path: `/users/${id}` },
            { label: 'Edit User' },
          ]}
        />
      </div>
      
      <UserForm userId={id} onBack={handleBack} />
    </>
  );
} 