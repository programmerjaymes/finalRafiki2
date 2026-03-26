import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export function jsonSafe<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_k, v) => (typeof v === 'bigint' ? v.toString() : v))
  );
}
