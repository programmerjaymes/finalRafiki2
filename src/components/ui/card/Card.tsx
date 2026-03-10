import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div 
      className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}