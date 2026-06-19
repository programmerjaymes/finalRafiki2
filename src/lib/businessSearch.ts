import { Prisma } from '@prisma/client';

const insensitive = (token: string) => ({
  contains: token,
  mode: 'insensitive' as const,
});

/** Fields matched when a user searches businesses (name, description, contact, location, category). */
export function businessSearchTokenConditions(
  token: string,
): Prisma.BusinessWhereInput[] {
  const match = insensitive(token);
  return [
    { name: match },
    { description: match },
    { phone: match },
    { email: match },
    { website: match },
    { whatsapp: match },
    { street: match },
    {
      category: {
        OR: [{ name: match }, { nameEn: match }, { nameSw: match }],
      },
    },
    { region: { name: match } },
    { district: { name: match } },
    { ward: { name: match } },
  ];
}

/** Build a Prisma where fragment for free-text business search. */
export function businessTextSearchWhere(
  query: string,
): Prisma.BusinessWhereInput | undefined {
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return undefined;
  if (tokens.length === 1) {
    return { OR: businessSearchTokenConditions(tokens[0]) };
  }
  return {
    AND: tokens.map((token) => ({ OR: businessSearchTokenConditions(token) })),
  };
}
