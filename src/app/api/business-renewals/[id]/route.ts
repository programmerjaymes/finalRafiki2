import { after, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { recordAudit } from '@/lib/activityLog';
import { notifyBusinessDecision } from '@/lib/businessDecisionSms';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const isAdmin =
      session?.user?.role === 'ADMIN' || session?.user?.role === 'BUSINESS_REGISTRAR';
    if (!session?.user?.id || !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const decision = body.decision === 'APPROVED' ? 'APPROVED' : body.decision === 'REJECTED' ? 'REJECTED' : null;
    const rejectionReason =
      typeof body.rejectionReason === 'string' ? body.rejectionReason.trim().slice(0, 300) : '';
    if (!decision) {
      return NextResponse.json({ error: 'Invalid renewal decision' }, { status: 400 });
    }
    if (decision === 'REJECTED' && !rejectionReason) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
    }

    const renewal = await prisma.businessRenewalRequest.findUnique({
      where: { id },
      include: { business: true, newBundle: true },
    });
    if (!renewal) {
      return NextResponse.json({ error: 'Renewal request not found' }, { status: 404 });
    }
    if (renewal.status !== 'PENDING') {
      return NextResponse.json({ error: 'This renewal request has already been decided' }, { status: 409 });
    }

    if (decision === 'APPROVED') {
      const startedAt = new Date();
      const expiresAt = new Date(startedAt);
      expiresAt.setDate(expiresAt.getDate() + renewal.newBundle.duration);

      await prisma.$transaction(async (tx) => {
        const claimed = await tx.businessRenewalRequest.updateMany({
          where: { id, status: 'PENDING' },
          data: { status: 'APPROVED', decidedById: session.user.id, decidedAt: startedAt },
        });
        if (claimed.count !== 1) throw new Error('Renewal request was already decided');

        await tx.business.update({
          where: { id: renewal.businessId },
          data: {
            bundleId: renewal.newBundleId,
            bundleExpiresAt: expiresAt,
            isApproved: true,
            isVerified: true,
            deactivationReason: null,
          },
        });
        await tx.businessBundleHistory.create({
          data: {
            businessId: renewal.businessId,
            bundleId: renewal.newBundleId,
            bundleName: renewal.newBundle.name,
            bundlePrice: renewal.newBundle.price,
            bundleDuration: renewal.newBundle.duration,
            startedAt,
            expiresAt,
            source: 'RENEWAL',
            renewalRequestId: renewal.id,
          },
        });
        if (renewal.paymentReference) {
          await tx.payment.updateMany({
            where: { businessId: renewal.businessId, paymentReference: renewal.paymentReference },
            data: { paymentStatus: 'COMPLETED' },
          });
        }
      });

      after(() => notifyBusinessDecision(renewal.businessId, 'APPROVED', session.user.id));
    } else {
      await prisma.$transaction(async (tx) => {
        const claimed = await tx.businessRenewalRequest.updateMany({
          where: { id, status: 'PENDING' },
          data: {
            status: 'REJECTED',
            rejectionReason,
            decidedById: session.user.id,
            decidedAt: new Date(),
          },
        });
        if (claimed.count !== 1) throw new Error('Renewal request was already decided');

        await tx.business.update({
          where: { id: renewal.businessId },
          data: { deactivationReason: `Renewal rejected: ${rejectionReason}` },
        });
        if (renewal.paymentReference) {
          await tx.payment.updateMany({
            where: { businessId: renewal.businessId, paymentReference: renewal.paymentReference },
            data: { paymentStatus: 'FAILED' },
          });
        }
      });
    }

    await recordAudit({
      actorId: session.user.id,
      action: `BUSINESS_RENEWAL_${decision}`,
      entityType: 'Business',
      entityId: renewal.businessId,
      description: `${decision === 'APPROVED' ? 'Approved' : 'Rejected'} renewal for ${renewal.business.name}`,
      metadata: { renewalRequestId: renewal.id, newBundleId: renewal.newBundleId, rejectionReason: rejectionReason || null },
      request,
    });
    revalidateTag('businesses');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deciding business renewal:', error);
    return NextResponse.json({ error: 'Failed to update renewal request' }, { status: 500 });
  }
}
