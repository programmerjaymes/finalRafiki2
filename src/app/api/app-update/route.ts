import { NextResponse } from 'next/server';
import { appUpdateConfig } from '@/lib/appUpdateConfig';

export const dynamic = 'force-dynamic';

/** Public: Flutter app checks this on launch to prompt for APK updates. */
export async function GET() {
  return NextResponse.json(
    {
      ...appUpdateConfig,
      checkedAt: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        'Access-Control-Allow-Origin': '*',
      },
    },
  );
}
