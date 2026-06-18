export const TZ_COUNTRY_CODE = '255';
export const TZ_PHONE_PREFIX = `+${TZ_COUNTRY_CODE}`;

/** Local digits only (after +255), stripping leading 0 or 255 if pasted. */
export function phoneLocalPart(value: string | null | undefined): string {
  if (!value) return '';
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith(TZ_COUNTRY_CODE)) {
    digits = digits.slice(TZ_COUNTRY_CODE.length);
  }
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 9);
}

/** Build full international phone (+255XXXXXXXXX). */
export function formatFullPhone(localPart: string): string {
  const digits = phoneLocalPart(localPart);
  if (!digits) return '';
  return `${TZ_PHONE_PREFIX}${digits}`;
}

export function isValidTzPhone(value: string | null | undefined): boolean {
  return phoneLocalPart(value).length === 9;
}

/** Digits only for wa.me links (e.g. 255712345678). */
export function whatsappDigits(value: string | null | undefined): string {
  if (!value) return '';
  return value.replace(/\D/g, '');
}

/** Build https://wa.me/… link for opening a WhatsApp chat. */
export function whatsappChatUrl(value: string | null | undefined): string | null {
  const digits = whatsappDigits(value);
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}

/** Normalize optional WhatsApp number to +255… or null. */
export function normalizeWhatsapp(value: string | null | undefined): string | null {
  const full = formatFullPhone(phoneLocalPart(value ?? ''));
  return full || null;
}
