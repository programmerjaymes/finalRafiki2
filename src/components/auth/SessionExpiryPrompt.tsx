'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import ConfirmDialog from '@/components/common/ConfirmDialog';

type Props = {
  /**
   * Show the prompt when the session will expire within this many seconds.
   * Default: 120 seconds.
   */
  warnBeforeSeconds?: number;
  /**
   * Auto-logout countdown length once the dialog is shown.
   * Default: 30 seconds.
   */
  countdownSeconds?: number;
};

export default function SessionExpiryPrompt({
  warnBeforeSeconds = 120,
  countdownSeconds = 30,
}: Props) {
  const { data: session, status, update } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [countdownLeft, setCountdownLeft] = useState(countdownSeconds);
  const hasPromptedForThisExpiryRef = useRef<string | null>(null);

  const expiresAtMs = useMemo(() => {
    if (!session?.expires) return null;
    const ms = new Date(session.expires).getTime();
    return Number.isFinite(ms) ? ms : null;
  }, [session?.expires]);

  const secondsUntilExpiry = useMemo(() => {
    if (!expiresAtMs) return null;
    return Math.floor((expiresAtMs - Date.now()) / 1000);
  }, [expiresAtMs]);

  // Open prompt near expiry (only once per expiry timestamp)
  useEffect(() => {
    if (status !== 'authenticated') return;
    if (!session?.expires) return;
    if (expiresAtMs === null) return;

    const tick = () => {
      const remaining = Math.floor((expiresAtMs - Date.now()) / 1000);

      if (remaining <= 0) {
        signOut({ callbackUrl: '/signin' });
        return;
      }

      const alreadyPrompted = hasPromptedForThisExpiryRef.current === session.expires;
      if (!alreadyPrompted && remaining <= warnBeforeSeconds) {
        hasPromptedForThisExpiryRef.current = session.expires;
        setCountdownLeft(countdownSeconds);
        setIsOpen(true);
      }
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [countdownSeconds, expiresAtMs, session?.expires, status, warnBeforeSeconds]);

  // Countdown once dialog is open
  useEffect(() => {
    if (!isOpen) return;

    const interval = window.setInterval(() => {
      setCountdownLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          // Auto logout if user doesn't respond
          signOut({ callbackUrl: '/signin' });
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isOpen]);

  const handleExtend = async () => {
    try {
      await update();
    } finally {
      setIsOpen(false);
    }
  };

  const handleLogoutNow = () => {
    setIsOpen(false);
    signOut({ callbackUrl: '/signin' });
  };

  if (status !== 'authenticated') return null;

  const expiresText =
    secondsUntilExpiry === null
      ? 'soon'
      : secondsUntilExpiry <= 60
        ? `${secondsUntilExpiry}s`
        : `${Math.ceil(secondsUntilExpiry / 60)} min`;

  return (
    <ConfirmDialog
      isOpen={isOpen}
      title="Session expiring soon"
      message={`Your session will expire in ${expiresText}. Extend to stay signed in. Auto logout in ${countdownLeft}s.`}
      confirmText="Extend session"
      cancelText="Log out"
      onConfirm={handleExtend}
      onClose={handleLogoutNow}
      variant="warning"
    />
  );
}

