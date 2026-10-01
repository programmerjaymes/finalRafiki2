'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import SessionExpiryPrompt from '@/components/auth/SessionExpiryPrompt';
import SessionValidator from '@/components/auth/SessionValidator';
import NavigationAudit from '@/components/auth/NavigationAudit';
import { LocaleProvider } from '@/lib/LocaleProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <LocaleProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <SessionExpiryPrompt />
          <SessionValidator />
          <NavigationAudit />
          {children}
        </ThemeProvider>
      </LocaleProvider>
    </SessionProvider>
  );
}
