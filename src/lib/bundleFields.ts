import type { Bundle } from '@prisma/client';

export function parseBundleAllowedFields(bundle: Bundle | null): string[] {
  if (!bundle?.allowedFields) return [];
  try {
    const parsed = JSON.parse(bundle.allowedFields);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function bundleAllows(bundle: Bundle | null, field: string): boolean {
  return parseBundleAllowedFields(bundle).includes(field);
}
