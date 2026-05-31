'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { t, type Locale } from '@/lib/i18n';
import { useLocale, useSetLocale } from '@/lib/useLocale';
import RefreshButton from '@/components/landing/RefreshButton';
import { brandColors } from '@/lib/brandColors';

function LogoMark() {
  return (
    <span
      className="relative h-10 w-10 shrink-0 inline-flex items-center justify-center rounded-xl bg-white shadow-md ring-2 ring-[#d4b84a]/60"
      style={{ color: brandColors.accent }}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path
          d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="10" r="2.5" fill="currentColor" />
      </svg>
    </span>
  );
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const setLocale = useSetLocale();
  const messages = t(locale);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  if (!mounted) {
    return (
      <header
        className="fixed top-0 inset-x-0 z-50 h-16 bg-primary"
        style={{ background: brandColors.navBackground }}
        aria-hidden
      />
    );
  }

  return (
    <motion.header
      className={`fixed top-0 inset-x-0 z-50 transition-shadow duration-300 ${
        scrolled ? 'shadow-xl shadow-black/25' : 'shadow-md shadow-black/15'
      }`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div
        className="relative text-white overflow-hidden bg-gradient-to-r from-primary via-primary to-primary-dark"
        style={{ background: brandColors.navBackground }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          aria-hidden
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h20v20H0V0zm20 20h20v20H20V20z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '20px 20px',
          }}
        />
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(201, 162, 39, 0.12)' }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-black/15 blur-2xl"
          aria-hidden
        />

        <div className="relative w-full px-3 sm:px-4 md:px-5 lg:px-6">
          <nav
            className="flex items-center justify-between gap-3 h-16 sm:h-[4.25rem]"
            aria-label="Main"
          >
            <Link href="/" className="flex items-center gap-2.5 min-w-0 group">
              <LogoMark />
              <div className="min-w-0 leading-tight">
                <span className="block text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-secondary transition-colors">
                  Rafiki
                </span>
                <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                  {locale === 'sw' ? 'Orodha ya Biashara' : 'Business Directory'}
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center">
              <div className="flex items-center rounded-full bg-black/15 ring-1 ring-white/20 p-1 backdrop-blur-sm">
                <NavLink href="/search" active={pathname === '/search'}>
                  {messages.nav.search}
                </NavLink>
                <NavLink href="/business-create" active={pathname === '/business-create'}>
                  {messages.nav.registerBusiness}
                </NavLink>
                {session && (
                  <NavLink
                    href="/business-my-businesses"
                    active={pathname.startsWith('/business-my-businesses')}
                  >
                    {messages.nav.myBusinesses}
                  </NavLink>
                )}
                {session?.user.role === 'ADMIN' && (
                  <NavLink href="/dashboard" active={pathname.startsWith('/dashboard')}>
                    {messages.nav.adminDashboard}
                  </NavLink>
                )}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <RefreshButton variant="nav" />

              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as Locale)}
                className="rounded-full text-xs font-bold border border-white/25 bg-white/10 text-white py-2 pl-3 pr-8 cursor-pointer hover:bg-white/20 transition backdrop-blur-sm"
                aria-label={messages.nav.language}
              >
                <option value="en" className="text-gray-900">
                  EN
                </option>
                <option value="sw" className="text-gray-900">
                  SW
                </option>
              </select>

              <ThemeToggle theme={theme} setTheme={setTheme} />

              {session ? (
                <Link
                  href="/api/auth/signout"
                  className="rounded-full border border-white/35 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 transition"
                >
                  {messages.nav.signOut}
                </Link>
              ) : (
                <Link
                  href="/signin"
                  className="rounded-full bg-secondary text-gray-900 px-5 py-2 text-sm font-bold shadow-lg shadow-black/20 hover:bg-secondary-light transition"
                  style={{ backgroundColor: '#fdd00d' }}
                >
                  {messages.nav.signIn}
                </Link>
              )}
            </div>

            <div className="flex md:hidden items-center gap-1">
              <RefreshButton variant="nav" className="!px-2.5" />
              <ThemeToggle theme={theme} setTheme={setTheme} />
              <button
                type="button"
                onClick={() => setIsMenuOpen((o) => !o)}
                className="p-2.5 rounded-xl text-white hover:bg-white/15 ring-1 ring-white/20 transition"
                aria-expanded={isMenuOpen}
                aria-label="Open menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </nav>
        </div>

        <div className="h-1" style={{ background: brandColors.navGoldStripe }} aria-hidden />
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden border-t border-white/10 shadow-2xl"
            style={{ backgroundColor: brandColors.navMobileMenu }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className="w-full px-3 sm:px-4 md:px-5 lg:px-6 py-3 space-y-0.5">
              <MobileNavLink href="/search" onClick={() => setIsMenuOpen(false)}>
                {messages.nav.search}
              </MobileNavLink>
              <MobileNavLink href="/business-create" onClick={() => setIsMenuOpen(false)}>
                {messages.nav.registerBusiness}
              </MobileNavLink>
              {session && (
                <>
                  <MobileNavLink href="/business-my-businesses" onClick={() => setIsMenuOpen(false)}>
                    {messages.nav.myBusinesses}
                  </MobileNavLink>
                  {session.user.role === 'ADMIN' && (
                    <MobileNavLink href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      {messages.nav.adminDashboard}
                    </MobileNavLink>
                  )}
                  <MobileNavLink href="/api/auth/signout" onClick={() => setIsMenuOpen(false)}>
                    {messages.nav.signOut}
                  </MobileNavLink>
                </>
              )}
              {!session && (
                <Link
                  href="/signin"
                  className="block text-center mt-2 rounded-xl bg-secondary text-gray-900 py-3 font-bold shadow-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {messages.nav.signIn}
                </Link>
              )}
              <label className="block px-3 pt-3 text-xs font-semibold uppercase tracking-wider text-white/60">
                {messages.nav.language}
              </label>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as Locale)}
                className="w-full rounded-xl border border-white/20 bg-white/10 text-white px-3 py-2.5 text-sm font-semibold mb-2"
              >
                <option value="en" className="text-gray-900">
                  English
                </option>
                <option value="sw" className="text-gray-900">
                  Kiswahili
                </option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function ThemeToggle({ theme, setTheme }: { theme?: string; setTheme: (t: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-full border border-white/25 bg-white/10 text-white hover:bg-white/20 transition backdrop-blur-sm"
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? (
        <svg className="h-5 w-5 text-secondary" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
}

interface NavLinkProps {
  href: string;
  children: ReactNode;
  active?: boolean;
}

const NavLink = ({ href, children, active }: NavLinkProps) => (
  <Link
    href={href}
    className={`relative px-3.5 py-2 rounded-full text-sm font-semibold transition-all ${
      active
        ? 'bg-secondary text-gray-900 shadow-md'
        : 'text-white/90 hover:text-white hover:bg-white/15'
    }`}
    style={active ? { backgroundColor: '#fdd00d' } : undefined}
  >
    {children}
  </Link>
);

interface MobileNavLinkProps {
  href: string;
  children: ReactNode;
  onClick: () => void;
}

const MobileNavLink = ({ href, children, onClick }: MobileNavLinkProps) => (
  <Link
    href={href}
    className="block px-3 py-3 rounded-xl text-white font-semibold hover:bg-white/10 border-b border-white/5 last:border-0"
    onClick={onClick}
  >
    {children}
  </Link>
);
