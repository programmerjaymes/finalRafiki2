import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PrivacyRequestType } from '@prisma/client';

export const dynamic = 'force-dynamic';

const ALLOWED_TYPES: PrivacyRequestType[] = [
  PrivacyRequestType.ACCOUNT_DELETION,
  PrivacyRequestType.DATA_DELETION,
];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const type = body.type as string;
    const details = typeof body.details === 'string' ? body.details.trim() : '';
    let email = typeof body.email === 'string' ? body.email.trim() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';

    if (!ALLOWED_TYPES.includes(type as PrivacyRequestType)) {
      return NextResponse.json(
        { error: 'type must be ACCOUNT_DELETION or DATA_DELETION.' },
        { status: 400 },
      );
    }

    if (details.length < 10) {
      return NextResponse.json(
        { error: 'Please describe your request in at least 10 characters.' },
        { status: 400 },
      );
    }

    if (session?.user?.email) {
      email = session.user.email;
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required so we can contact you about this request.' },
        { status: 400 },
      );
    }

    const created = await prisma.privacyRequest.create({
      data: {
        userId: session?.user?.id ?? null,
        email,
        name: name || session?.user?.name || null,
        type: type as PrivacyRequestType,
        details,
      },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json({
      ok: true,
      id: created.id,
      message:
        'Your request was submitted. Our team will review it and respond by email where needed.',
    });
  } catch (error: unknown) {
    console.error('privacy-requests POST:', error);
    return NextResponse.json(
      { error: 'Failed to submit request.' },
      { status: 500 },
    );
  }
}
