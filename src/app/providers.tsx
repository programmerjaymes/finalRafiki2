'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import SessionExpiryPrompt from '@/components/auth/SessionExpiryPrompt';
import SessionValidator from '@/components/auth/SessionValidator';
import { LocaleProvider } from '@/lib/LocaleProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LocaleProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <SessionExpiryPrompt />
          <SessionValidator />
          {children}
        </ThemeProvider>
      </LocaleProvider>
    </SessionProvider>
  );
}
