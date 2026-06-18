'use client';

import React, { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

interface BusinessOwnerAuthWrapperProps {
  children: React.ReactNode;
}

export const BusinessOwnerAuthWrapper: React.FC<BusinessOwnerAuthWrapperProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const wasAuthorizedRef = useRef(false);

  const isBusinessOwner =
    status === 'authenticated' && session?.user?.role === 'BUSINESS_OWNER';

  if (isBusinessOwner) {
    wasAuthorizedRef.current = true;
  }

  useEffect(() => {
    if (status === 'loading') return;

    const callbackUrl = encodeURIComponent(pathname || '/business-dashboard');

    if (status === 'unauthenticated') {
      router.push(`/signin?callbackUrl=${callbackUrl}`);
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'BUSINESS_OWNER') {
      router.push('/');
    }
  }, [session, status, router, pathname]);

  // Only block the page on the very first auth check — never unmount the form during background session refetches.
  if (status === 'loading' && !wasAuthorizedRef.current) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
        <span className="ml-3 text-lg font-medium">Checking authentication...</span>
      </div>
    );
  }

  if (wasAuthorizedRef.current && status === 'loading') {
    return <>{children}</>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg font-medium">Redirecting to login page...</span>
      </div>
    );
  }

  if (status === 'authenticated' && session?.user?.role !== 'BUSINESS_OWNER') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg font-medium">You must be a business owner to access this page</span>
      </div>
    );
  }

  return <>{children}</>;
};
