'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { t, type Locale } from '@/lib/i18n';
import { useLocale, useSetLocale } from '@/lib/useLocale';

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
  const isHome = pathname === '/';
  const solidNav = scrolled || !isHome;

  const langSelectClass = `rounded-lg text-sm font-medium border py-2 pl-3 pr-9 max-w-[11rem] cursor-pointer transition ${
    solidNav
      ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200'
      : 'border-white/35 bg-white/10 text-white'
  }`;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle theme mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        solidNav
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className={`text-2xl font-bold transition-colors duration-300
                ${solidNav
                  ? 'text-primary dark:text-white' 
                  : 'text-white dark:text-white'}`}>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                  Rafiki
                </span>
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <NavLink href="/search" scrolled={solidNav}>
              {messages.nav.search}
            </NavLink>
            <NavLink href="/business-create" scrolled={solidNav}>
              {messages.nav.registerBusiness}
            </NavLink>
            
            {session ? (
              <>
                <NavLink href="/business-my-businesses" scrolled={solidNav}>
                  {messages.nav.myBusinesses}
                </NavLink>
                {session.user.role === 'ADMIN' && (
                  <NavLink href="/dashboard" scrolled={solidNav}>
                    {messages.nav.adminDashboard}
                  </NavLink>
                )}
                <NavLink href="/api/auth/signout" scrolled={solidNav}>
                  {messages.nav.signOut}
                </NavLink>
              </>
            ) : (
              <Link 
                href="/signin"
                className={`
                  ${solidNav
                    ? 'bg-primary text-white hover:bg-primary-dark' 
                    : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border border-white/30'
                  } 
                  px-4 py-2.5 rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-md
                `}
                style={solidNav ? {} : {}}
              >
                {messages.nav.signIn}
              </Link>
            )}

            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs font-medium whitespace-nowrap ${
                  solidNav
                    ? 'text-gray-600 dark:text-gray-400'
                    : 'text-white/85'
                }`}
              >
                {messages.nav.language}
              </span>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as Locale)}
                className={langSelectClass}
                aria-label={messages.nav.language}
              >
                <option value="en">English</option>
                <option value="sw">Kiswahili</option>
              </select>
            </div>
            
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-full ${
                solidNav
                  ? 'bg-gray-100 dark:bg-gray-800' 
                  : 'bg-white/20 dark:bg-gray-800/40'
              }`}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Theme toggle for mobile */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-full ${
                solidNav
                  ? 'bg-gray-100 dark:bg-gray-800' 
                  : 'bg-white/20 dark:bg-gray-800/40'
              }`}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-md ${solidNav ? 'text-primary dark:text-white' : 'text-white'} hover:bg-primary-light/20`}
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <motion.div 
            className="md:hidden py-4 bg-white dark:bg-gray-800 shadow-lg rounded-b-xl border-t border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col space-y-1 px-2">
              <MobileNavLink href="/search" onClick={() => setIsMenuOpen(false)}>
                {messages.nav.search}
              </MobileNavLink>
              <MobileNavLink href="/business-create" onClick={() => setIsMenuOpen(false)}>
                {messages.nav.registerBusiness}
              </MobileNavLink>
              
              {session ? (
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
              ) : (
                <Link
                  href="/signin"
                  className="w-full text-center bg-primary text-white px-3 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors duration-200 my-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {messages.nav.signIn}
                </Link>
              )}

              <label className="block px-3 pt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                {messages.nav.language}
              </label>
              <select
                value={locale}
                onChange={(e) => {
                  setLocale(e.target.value as Locale);
                  setIsMenuOpen(false);
                }}
                className="w-full mx-2 mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-3 py-3 text-base font-medium"
                aria-label={messages.nav.language}
              >
                <option value="en">English</option>
                <option value="sw">Kiswahili</option>
              </select>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Add a colored border at the bottom when scrolled */}
      {scrolled && (
        <div className="h-0.5 w-full bg-gradient-to-r from-primary via-primary-light to-secondary"></div>
      )}
    </motion.nav>
  );
}

interface NavLinkProps {
  href: string;
  children: ReactNode;
  scrolled: boolean;
}

const NavLink = ({ href, children, scrolled }: NavLinkProps) => {
  return (
    <Link 
      href={href} 
      className={`
        text-sm font-medium transition-colors duration-300 relative group
        ${scrolled 
          ? 'text-gray-800 dark:text-gray-200 hover:text-primary' 
          : 'text-gray-100 hover:text-white dark:text-gray-200 dark:hover:text-white'
        }
      `}
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full"></span>
    </Link>
  );
};

interface MobileNavLinkProps {
  href: string;
  children: ReactNode;
  onClick: () => void;
}

const MobileNavLink = ({ href, children, onClick }: MobileNavLinkProps) => {
  return (
    <Link
      href={href}
      className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-secondary hover:bg-primary-light/10 dark:hover:bg-primary-dark/10 px-3 py-3 rounded-lg text-base font-medium transition block"
      onClick={onClick}
    >
      {children}
    </Link>
  );
};
