import React from 'react';

export const metadata = {
  title: 'Business Details | Rafiki',
  description: 'View detailed information about a business on Rafiki',
};

export default function BusinessesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
    </div>
  );
} 