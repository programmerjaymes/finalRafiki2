import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

/**
 * DELETE current user (self-service). Requires JSON body: { "password": "..." }.
 * Blocks if the user still owns any business (must remove listings or use a privacy request).
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const password =
      body && typeof body === 'object' && typeof body.password === 'string'
        ? body.password
        : '';

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required to confirm account deletion.' },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, hashedPassword: true },
    });

    if (!user?.hashedPassword) {
      return NextResponse.json(
        {
          error:
            'This account cannot be deleted automatically. Please use the request form or contact support.',
        },
        { status: 400 },
      );
    }

    const passwordOk = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordOk) {
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 403 });
    }

    const ownedBusinesses = await prisma.business.count({
      where: { ownerId: user.id },
    });

    if (ownedBusinesses > 0) {
      return NextResponse.json(
        {
          error:
            'You still have one or more businesses linked as owner. Remove or transfer those listings first, or submit an account deletion request below for manual handling.',
        },
        { status: 409 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.review.deleteMany({ where: { userId: user.id } });
      await tx.searchQuery.deleteMany({ where: { userId: user.id } });
      await tx.businessRegistration.deleteMany({ where: { userId: user.id } });
      await tx.payment.deleteMany({ where: { userId: user.id } });
      await tx.business.updateMany({
        where: { registrarId: user.id },
        data: { registrarId: null },
      });
      await tx.session.deleteMany({ where: { userId: user.id } });
      await tx.account.deleteMany({ where: { userId: user.id } });
      await tx.user.delete({ where: { id: user.id } });
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error('DELETE /api/users/me:', error);
    return NextResponse.json(
      { error: 'Could not delete account. Try a privacy request instead.' },
      { status: 500 },
    );
  }
}
