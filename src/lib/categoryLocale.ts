export type AppLocale = 'en' | 'sw';

export function getLocaleFromRequest(request: Request): AppLocale {
  const cookieHeader = request.headers.get('cookie') || '';
  const m = cookieHeader.match(/(?:^|;\s*)rafiki_locale=(en|sw)(?:;|$)/i);
  if (m) return m[1].toLowerCase() as AppLocale;
  const al = request.headers.get('accept-language') || '';
  if (/^(sw|sw-)/i.test(al.trim())) return 'sw';
  return 'en';
}

type CategoryLabelSource = {
  name: string;
  nameEn?: string;
  nameSw?: string;
  description?: string | null;
  descriptionEn?: string | null;
  descriptionSw?: string | null;
};

/** Picks display name/description for the current locale (falls back to legacy `name` / `description`). */
export function localizedCategoryFields(
  cat: CategoryLabelSource,
  locale: AppLocale
): { name: string; description: string | null } {
  const name =
    locale === 'sw'
      ? cat.nameSw || cat.name
      : cat.nameEn || cat.name;
  const description =
    locale === 'sw'
      ? cat.descriptionSw ?? cat.description ?? null
      : cat.descriptionEn ?? cat.description ?? null;
  return { name, description };
}
