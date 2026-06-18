import { prisma } from '@/lib/prisma';
import { normalizeWhatsapp } from '@/lib/phoneNumber';

/** Persist WhatsApp via SQL so it works even if Prisma Client was generated before the column existed. */
export async function setBusinessWhatsapp(
  businessId: string,
  whatsapp: string | null | undefined,
): Promise<void> {
  const normalized = normalizeWhatsapp(whatsapp ?? '');
  await prisma.$executeRaw`
    UPDATE businesses SET whatsapp = ${normalized} WHERE id = ${businessId}
  `;
}
