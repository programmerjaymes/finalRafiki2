'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function NavigationAudit() {
  const pathname = usePathname();
  const { status } = useSession();
  const lastRecorded = useRef<string | null>(null);

  useEffect(() => {
    let installationId = window.localStorage.getItem('rafiki-web-installation-id');
    if (!installationId) {
      installationId = crypto.randomUUID();
      window.localStorage.setItem('rafiki-web-installation-id', installationId);
    }
    const recordUsage = (action: string) => {
      void fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-client-source': 'WEB' },
        body: JSON.stringify({ installationId, action, route: window.location.pathname }),
        keepalive: true,
      }).catch(() => undefined);
    };
    recordUsage('WEB_ACTIVE');
    const timer = window.setInterval(() => recordUsage('WEB_HEARTBEAT'), 5 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

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
