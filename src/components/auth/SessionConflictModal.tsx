'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { brandColors } from '@/lib/brandColors';

interface SessionConflictModalProps {
  isOpen: boolean;
  email: string;
  password: string;
  onClose: () => void;
  onSwitchSuccess: () => void;
}

export default function SessionConflictModal({
  isOpen,
  email,
  password,
  onClose,
  onSwitchSuccess,
}: SessionConflictModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSwitchHere = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        switchSession: 'true',
        redirect: false,
        callbackUrl: window.location.pathname,
      });

      if (result?.error) {
        setError('Failed to switch session. Please try again.');
      } else if (result?.ok) {
        onSwitchSuccess();
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
          <svg
            className="h-8 w-8 text-yellow-600 dark:text-yellow-400"
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

        {/* Title */}
        <h3 className="mb-2 text-center text-xl font-bold text-gray-900 dark:text-white">
          Active Session Detected
        </h3>

        {/* Description */}
        <p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-300">
          You are already logged in on another tab or device. For security, only one active session is allowed.
        </p>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSwitchHere}
            disabled={isLoading}
            className="w-full rounded-xl py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: brandColors.accent }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Switching...
              </span>
            ) : (
              'Switch Here'
            )}
          </button>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-3 font-semibold text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

        {/* Info */}
        <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          Clicking &quot;Switch Here&quot; will log you out from all other devices and tabs.
        </p>
      </div>
    </div>
  );
}
