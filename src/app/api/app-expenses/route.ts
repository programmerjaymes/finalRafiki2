import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { AppExpenseCategory, AppExpenseStatus, Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { saveExpenseEvidence } from '@/lib/expenseEvidenceStorage';
import { recordAudit } from '@/lib/activityLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'ADMIN' ? session : null;
}

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const status = url.searchParams.get('status');
  const search = url.searchParams.get('search')?.trim() || '';
  const where: Prisma.AppExpenseWhereInput = {};
  if (category && Object.values(AppExpenseCategory).includes(category as AppExpenseCategory)) {
    where.category = category as AppExpenseCategory;
  }
  if (status && Object.values(AppExpenseStatus).includes(status as AppExpenseStatus)) {
    where.status = status as AppExpenseStatus;
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { vendor: { contains: search, mode: 'insensitive' } },
      { reference: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } },
    ];
  }

  const expenses = await prisma.appExpense.findMany({
    where,
    include: { createdBy: { select: { name: true } } },
    orderBy: [{ applicableFrom: 'desc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json({ expenses }, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session?.user?.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const data = await request.formData();
    const title = String(data.get('title') || '').trim().slice(0, 160);
    const category = String(data.get('category') || '') as AppExpenseCategory;
    const vendor = String(data.get('vendor') || '').trim().slice(0, 160);
    const reference = String(data.get('reference') || '').trim().slice(0, 160);
    const currency = String(data.get('currency') || 'TZS').trim().toUpperCase().slice(0, 3);
    const status = String(data.get('status') || 'PAID') as AppExpenseStatus;
    const amount = Number(data.get('amount'));
    const applicableFrom = new Date(String(data.get('applicableFrom') || ''));
    const applicableTo = new Date(String(data.get('applicableTo') || ''));
    const paidAtRaw = String(data.get('paidAt') || '');
    const notes = String(data.get('notes') || '').trim().slice(0, 3000);
    const evidence = data.get('evidence');

    if (!title || !Object.values(AppExpenseCategory).includes(category)) {
      return NextResponse.json({ error: 'Title and valid category are required' }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Enter a valid amount greater than zero' }, { status: 400 });
    }
    if (!['TZS', 'USD'].includes(currency)) {
      return NextResponse.json({ error: 'Currency must be TZS or USD' }, { status: 400 });
    }
    if (!Object.values(AppExpenseStatus).includes(status)) {
      return NextResponse.json({ error: 'Select a valid payment status' }, { status: 400 });
    }
    if (Number.isNaN(applicableFrom.getTime()) || Number.isNaN(applicableTo.getTime()) || applicableTo < applicableFrom) {
      return NextResponse.json({ error: 'Enter a valid applicability date range' }, { status: 400 });
    }
    if (paidAtRaw && Number.isNaN(new Date(paidAtRaw).getTime())) {
      return NextResponse.json({ error: 'Enter a valid payment date' }, { status: 400 });
    }
    if (!(evidence instanceof File) || evidence.size === 0) {
      return NextResponse.json({ error: 'Invoice or payment evidence is required' }, { status: 400 });
    }

    const evidenceUrl = await saveExpenseEvidence(evidence);
    const expense = await prisma.appExpense.create({
      data: {
        title,
        category,
        vendor: vendor || null,
        reference: reference || null,
        amount,
        currency: currency || 'TZS',
        status,
        paidAt: paidAtRaw ? new Date(paidAtRaw) : null,
        applicableFrom,
        applicableTo,
        notes: notes || null,
        evidenceUrl,
        evidenceName: evidence.name.slice(0, 255),
        evidenceMimeType: evidence.type,
        createdById: session.user.id,
      },
      include: { createdBy: { select: { name: true } } },
    });
    await recordAudit({
      actorId: session.user.id,
      action: 'APP_EXPENSE_CREATED',
      entityType: 'AppExpense',
      entityId: expense.id,
      description: `Recorded ${expense.title} expense`,
      metadata: { category, amount, currency },
      request,
    });
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Unable to create app expense:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to save expense' },
      { status: 500 },
    );
  }
}
