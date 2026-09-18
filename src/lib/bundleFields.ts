import type { Bundle } from '@prisma/client';

function normalizeAllowedFields(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((field): field is string => typeof field === 'string')
      .map((field) => field.trim())
      .filter(Boolean);
  }

  if (typeof value !== 'string' || !value.trim()) return [];

  const trimmed = value.trim();
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (parsed !== value) return normalizeAllowedFields(parsed);
  } catch {
    // Older bundle records use comma-separated values instead of JSON.
  }

  return trimmed
    .split(',')
    .map((field) => field.trim())
    .filter(Boolean);
}

export function parseBundleAllowedFields(bundle: Bundle | null): string[] {
  if (!bundle?.allowedFields) return [];
  return [...new Set(normalizeAllowedFields(bundle.allowedFields))];
}

export function bundleAllows(bundle: Bundle | null, field: string): boolean {
  return parseBundleAllowedFields(bundle).includes(field);
}
