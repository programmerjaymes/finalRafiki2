'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

interface BusinessOwnerAuthWrapperProps {
  children: React.ReactNode;
}

export const BusinessOwnerAuthWrapper: React.FC<BusinessOwnerAuthWrapperProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    console.log('Auth status:', status);
    console.log('Session:', session);
    
    // If the user is not authenticated or is not a business owner, redirect to login
    if (status === 'unauthenticated') {
      console.log('User not authenticated, redirecting to login');
      router.push('/signin?callbackUrl=/business-dashboard');
      return;
    }
    
    if (status === 'authenticated' && session?.user?.role !== 'BUSINESS_OWNER') {
      console.log(`User authenticated but has wrong role: ${session?.user?.role}`);
      router.push('/');
    }
  }, [session, status, router]);

  // Show loading spinner while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
        <span className="ml-3 text-lg font-medium">Checking authentication...</span>
      </div>
    );
  }

  // If the user is not authenticated or is not checking, don't render children
  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg font-medium">Redirecting to login page...</span>
      </div>
    );
  }

  // If the user is authenticated but not a business owner
  if (status === 'authenticated' && session?.user?.role !== 'BUSINESS_OWNER') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg font-medium">You must be a business owner to access this page</span>
      </div>
    );
  }

  // If the user is authenticated and is a business owner, render children
  return <>{children}</>;
}; 