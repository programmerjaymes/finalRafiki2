import { prisma } from '@/lib/prisma';

export async function getMobileUser(request: Request) {
  const token = request.headers.get('x-session-token')?.trim();
  if (!token) return null;
  const [user] = await prisma.$queryRaw<Array<{ id: string; name: string; email: string | null; phone: string | null; role: 'ADMIN' | 'BUSINESS_OWNER' | 'BUSINESS_REGISTRAR' | 'ACCOUNTANT' | 'AGENT' }>>`
    SELECT id, name, email, phone, role::text FROM users WHERE "mobileSessionToken" = ${token} LIMIT 1
  `;
  return user || null;
}
