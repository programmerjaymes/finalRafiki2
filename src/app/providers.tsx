'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import SessionExpiryPrompt from '@/components/auth/SessionExpiryPrompt';
import { LocaleProvider } from '@/lib/LocaleProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LocaleProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SessionExpiryPrompt />
          {children}
        </ThemeProvider>
      </LocaleProvider>
    </SessionProvider>
  );
}
