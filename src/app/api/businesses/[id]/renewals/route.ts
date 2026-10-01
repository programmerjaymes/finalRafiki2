import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { recordAudit } from '@/lib/activityLog';

function canAdminister(role?: string) {
  return role === 'ADMIN' || role === 'BUSINESS_REGISTRAR';
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const business = await prisma.business.findUnique({
    where: { id },
    select: { ownerId: true },
  });
  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }
  if (business.ownerId !== session.user.id && !canAdminister(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [history, requests] = await Promise.all([
    prisma.businessBundleHistory.findMany({
      where: { businessId: id },
      orderBy: { startedAt: 'desc' },
    }),
    prisma.businessRenewalRequest.findMany({
      where: { businessId: id },
      include: { newBundle: { select: { name: true, price: true, duration: true } } },
      orderBy: { requestedAt: 'desc' },
    }),
  ]);

  return NextResponse.json({ history, requests });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const bundleId = typeof body.bundleId === 'string' ? body.bundleId : '';
    const paymentReference =
      typeof body.paymentReference === 'string' ? body.paymentReference.trim().slice(0, 200) : '';
    if (!bundleId) {
      return NextResponse.json({ error: 'Select a renewal bundle' }, { status: 400 });
    }

    const [business, newBundle] = await Promise.all([
      prisma.business.findUnique({
        where: { id },
        include: {
          bundle: true,
          bundleHistory: { orderBy: { startedAt: 'desc' }, take: 1 },
          renewalRequests: { where: { status: 'PENDING' }, select: { id: true }, take: 1 },
        },
      }),
      prisma.bundle.findUnique({ where: { id: bundleId } }),
    ]);

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }
    const adminRequest = canAdminister(session.user.role);
    if (business.ownerId !== session.user.id && !adminRequest) {
      return NextResponse.json({ error: 'Only the business owner or an administrator can request renewal' }, { status: 403 });
    }
    if (!newBundle) {
      return NextResponse.json({ error: 'Selected bundle does not exist' }, { status: 400 });
    }
    if (business.bundleExpiresAt.getTime() > Date.now()) {
      return NextResponse.json({ error: 'This business bundle has not expired yet' }, { status: 409 });
    }
    if (business.renewalRequests.length > 0) {
      return NextResponse.json({ error: 'A renewal request is already awaiting approval' }, { status: 409 });
    }
    if (!adminRequest && newBundle.price > 0 && !paymentReference) {
      return NextResponse.json({ error: 'Payment reference is required for this bundle' }, { status: 400 });
    }

    const previousStartedAt = business.bundleHistory[0]?.startedAt ?? business.createdAt;
    const renewal = await prisma.$transaction(async (tx) => {
      const created = await tx.businessRenewalRequest.create({
        data: {
          businessId: business.id,
          previousBundleId: business.bundleId,
          previousBundleName: business.bundle.name,
          previousStartedAt,
          previousExpiresAt: business.bundleExpiresAt,
          newBundleId: newBundle.id,
          requestedById: session.user.id,
          paymentReference: paymentReference || null,
        },
        include: { newBundle: { select: { name: true, price: true, duration: true } } },
      });

      await tx.business.update({
        where: { id: business.id },
        data: {
          isApproved: false,
          isVerified: false,
          deactivationReason: 'Renewal awaiting administrator approval',
        },
      });

      if (!adminRequest && newBundle.price > 0) {
        await tx.payment.create({
          data: {
            amount: newBundle.price,
            paymentReference,
            paymentStatus: 'PENDING',
            paymentMethod: 'BANK_TRANSFER',
            businessId: business.id,
            userId: session.user.id,
            bundleId: newBundle.id,
          },
        });
      }
      return created;
    });

    await recordAudit({
      actorId: session.user.id,
      action: 'BUSINESS_RENEWAL_REQUESTED',
      entityType: 'Business',
      entityId: business.id,
      description: `Requested renewal of ${business.name} with ${newBundle.name}`,
      metadata: { renewalRequestId: renewal.id, previousBundleId: business.bundleId, newBundleId: newBundle.id },
      request,
    });
    revalidateTag('businesses');
    return NextResponse.json(renewal, { status: 201 });
  } catch (error) {
    console.error('Error requesting business renewal:', error);
    return NextResponse.json({ error: 'Failed to request business renewal' }, { status: 500 });
  }
}
