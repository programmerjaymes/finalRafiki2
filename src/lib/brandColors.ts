/** Softer Rafiki palette — burgundy/wine instead of bright red */

export const brandColors = {
  /** Main nav bar — deep warm charcoal with a hint of brand red */
  navBackground:
    'linear-gradient(105deg, #3d2a2e 0%, #352428 42%, #2a2224 100%)',
  navMobileMenu: '#2a2224',
  navGoldStripe: 'linear-gradient(90deg, #c9a227 0%, #e8c84a 50%, #c9a227 100%)',

  /** Buttons & CTAs — muted rose-burgundy (still on-brand, less loud) */
  accent: '#8f4a54',
  accentHover: '#7a4049',
  accentSoft: '#a66b73',

  /** Business cards on home */
  cardHeader:
    'linear-gradient(145deg, #5c3d42 0%, #453033 45%, #2a2426 100%)',
} as const;
