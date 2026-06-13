/** Rafiki brand palette — deep burgundy from product identity */

export const brandColors = {
  burgundy: '#8f0e27',
  burgundyDark: '#770b20',
  burgundyDarker: '#5f091a',

  /** Main nav bar */
  navBackground:
    'linear-gradient(105deg, #8f0e27 0%, #770b20 48%, #5f091a 100%)',
  navMobileMenu: '#5f091a',
  navGoldStripe: 'linear-gradient(90deg, #c9a227 0%, #e8c84a 50%, #c9a227 100%)',

  /** Buttons & CTAs */
  accent: '#8f0e27',
  accentHover: '#770b20',
  accentSoft: '#b71131',

  /** Business cards on home */
  cardHeader:
    'linear-gradient(145deg, #8f0e27 0%, #770b20 45%, #5f091a 100%)',

  /** Subtle checkerboard grid (promo panels, hero slides) */
  promoGridPattern: `url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M24 24h24v24H24zM0 0h24v24H0z'/%3E%3C/g%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M0 24h24v24H0zM24 0h24v24H24z'/%3E%3C/g%3E%3C/svg%3E")`,
} as const;
