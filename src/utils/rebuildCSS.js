// This file is used to force Tailwind to rebuild the CSS.
// It contains all the color classes we need to ensure they're included in the final CSS.

/**
 * @type {string[]}
 */
const colorClasses = [
  // Primary colors
  'text-primary',
  'bg-primary',
  'border-primary',
  'text-primary-light',
  'bg-primary-light',
  'border-primary-light',
  'text-primary-dark',
  'bg-primary-dark',
  'border-primary-dark',
  
  // Secondary colors
  'text-secondary',
  'bg-secondary',
  'border-secondary',
  'text-secondary-light',
  'bg-secondary-light',
  'border-secondary-light',
  'text-secondary-dark',
  'bg-secondary-dark',
  'border-secondary-dark',
  
  // Explicit hex value colors for reference:
  // Primary: #b71131 (crimson)
  // Primary Light: #c73351
  // Primary Dark: #8f0e27
  // Secondary: #fdd00d (yellow)
  // Secondary Light: #fed63d
  // Secondary Dark: #d1ac0b
];

export default colorClasses; 