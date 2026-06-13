import { Outfit } from 'next/font/google';
import './globals.css';
import '../styles/colors.module.css';
import '../styles/colors.css';
import '@/styles/sweetalert2.css';
import 'animate.css';

import { SidebarProvider } from '@/context/SidebarContext';
import Providers from './providers';

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <body className={`${outfit.className} bg-white text-gray-900 dark:bg-gray-900`}>
        <Providers>
          <SidebarProvider>{children}</SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}
