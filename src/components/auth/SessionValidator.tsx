'use client';

import { useEffect, useState } from 'react';
import { getSession, signOut, useSession } from 'next-auth/react';
import { brandColors } from '@/lib/brandColors';

export default function SessionValidator() {
  const { data: session } = useSession();
  const [showInvalidatedModal, setShowInvalidatedModal] = useState(false);

  useEffect(() => {
    if ((session as { isInvalidated?: boolean })?.isInvalidated) {
      setShowInvalidatedModal(true);
    }
  }, [session]);

  // Poll in the background without calling update() — that flips useSession to "loading"
  // and unmounts protected pages (e.g. business-create forms).
  useEffect(() => {
    const checkSession = async () => {
      const fresh = await getSession();
      if ((fresh as { isInvalidated?: boolean })?.isInvalidated) {
        setShowInvalidatedModal(true);
      }
    };

    const interval = setInterval(checkSession, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!showInvalidatedModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <svg
            className="h-8 w-8 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <h3 className="mb-2 text-center text-xl font-bold text-gray-900 dark:text-white">
          Session Ended
        </h3>

        <p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-300">
          Your session was ended because you logged in from another device or tab.
        </p>

        <button
          onClick={() => signOut({ callbackUrl: '/signin' })}
          className="w-full rounded-xl py-3 font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: brandColors.accent }}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}
