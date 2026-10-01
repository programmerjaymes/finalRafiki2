'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function NavigationAudit() {
  const pathname = usePathname();
  const { status } = useSession();
  const lastRecorded = useRef<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated' || !pathname || lastRecorded.current === pathname) return;
    lastRecorded.current = pathname;
    void fetch('/api/audit/navigation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname, status]);

  return null;
}
