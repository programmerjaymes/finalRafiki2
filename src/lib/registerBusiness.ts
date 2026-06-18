export const BUSINESS_CREATE_PATH = '/business-create';

/** Sign-up URL for guests who want to register a business (returns to create flow after auth). */
export const REGISTER_BUSINESS_SIGNUP_HREF = `/signup?callbackUrl=${encodeURIComponent(BUSINESS_CREATE_PATH)}`;

/** Register-business link: signup for guests, create page for logged-in owners. */
export function registerBusinessHref(
  session?: { user?: { role?: string | null } | null } | null
): string {
  if (session?.user?.role === 'BUSINESS_OWNER') {
    return BUSINESS_CREATE_PATH;
  }
  return REGISTER_BUSINESS_SIGNUP_HREF;
}
