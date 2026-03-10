'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

// Hook to check if user is authenticated and has admin role
export function useAdminProtection() {
  const { data: session, status } = useSession();
  
  useEffect(() => {
    // If the session is loaded and the user is not an admin, redirect
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      redirect('/signin');
    }
    
    // If the session is definitely not authenticated, redirect
    if (status === 'unauthenticated') {
      redirect('/signin');
    }
  }, [session, status]);
  
  return { session, status };
}

// Higher-order component to protect admin routes
export function withAdminProtection(Component: React.ComponentType<any>) {
  return function ProtectedRoute(props: any) {
    const { status } = useAdminProtection();
    
    // Show loading state while checking authentication
    if (status === 'loading') {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-t-4 border-b-4 border-primary rounded-full animate-spin"></div>
        </div>
      );
    }
    
    // If we get here, the user is authenticated and is an admin
    return <Component {...props} />;
  };
} 