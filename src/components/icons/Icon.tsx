import React from 'react';

interface IconProps {
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * A safe wrapper for SVG icons
 * Handles cases where the SVG import might fail
 */
export const Icon: React.FC<IconProps> = ({ Icon, className = '', fallback = null }) => {
  if (!Icon) {
    return <>{fallback}</>;
  }
  
  try {
    return <Icon className={className} />;
  } catch (error) {
    console.error('Error rendering icon:', error);
    return <>{fallback}</>;
  }
};

export default Icon; 