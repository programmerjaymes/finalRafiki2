import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

const PUBLIC_TAGS = [
  'businesses',
  'featured-businesses',
  'categories',
  'regions',
  'districts',
  'wards',
  'bundles',
] as const;

export async function POST() {
  for (const tag of PUBLIC_TAGS) {
    revalidateTag(tag);
  }

  return NextResponse.json(
    { ok: true, revalidated: PUBLIC_TAGS },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
