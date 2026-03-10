'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const footerSections = [
    {
      title: 'For Businesses',
      links: [
        { name: 'Register Business', href: '/business-create' },
        { name: 'Business Dashboard', href: '/business-dashboard' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Success Stories', href: '/success-stories' },
      ]
    },
    {
      title: 'For Customers',
      links: [
        { name: 'Find Services', href: '/search' },
        { name: 'Leave Reviews', href: '/reviews' },
        { name: 'Popular Categories', href: '/categories' },
        { name: 'Saved Businesses', href: '/saved' },
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Blog', href: '/blog' },
        { name: 'Contact', href: '/contact' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Cookies', href: '/cookies' },
        { name: 'Accessibility', href: '/accessibility' },
      ]
    }
  ];

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-secondary">
                Rafiki
              </span>
            </Link>
            <p className="mt-4 text-gray-400 dark:text-gray-500 text-sm">
              Connecting businesses and customers in the most efficient way possible.
            </p>
            <div className="mt-6 flex space-x-4">
              {['facebook', 'twitter', 'instagram', 'linkedin'].map(social => (
                <a 
                  key={social}
                  href={`https://${social}.com`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-gray-800 dark:bg-gray-900 flex items-center justify-center hover:bg-primary dark:hover:bg-secondary transition-colors"
                >
                  <span className="sr-only">{social}</span>
                  <div className="h-5 w-5 text-white dark:text-gray-900"></div>
                </a>
              ))}
            </div>
          </div>
          
          {/* Navigation columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-md font-semibold text-white dark:text-secondary mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-secondary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 dark:text-gray-600 text-sm">
            © {currentYear} Rafiki. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 dark:text-gray-600 hover:text-primary dark:hover:text-secondary text-sm">English</a>
            <a href="#" className="text-gray-500 dark:text-gray-600 hover:text-primary dark:hover:text-secondary text-sm">Support</a>
            <a href="#" className="text-gray-500 dark:text-gray-600 hover:text-primary dark:hover:text-secondary text-sm">Sitemap</a>
          </div>
        </div>
      </div>
      
      {/* Bottom decoration */}
      <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-secondary"></div>
    </footer>
  );
} 