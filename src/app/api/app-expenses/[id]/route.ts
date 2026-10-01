import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteExpenseEvidence } from '@/lib/expenseEvidenceStorage';
import { recordAudit } from '@/lib/activityLog';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  const expense = await prisma.appExpense.findUnique({ where: { id } });
  if (!expense) return NextResponse.json({ error: 'Expense not found' }, { status: 404 });

  await prisma.appExpense.delete({ where: { id } });
  await deleteExpenseEvidence(expense.evidenceUrl);
  await recordAudit({
    actorId: session.user.id,
    action: 'APP_EXPENSE_DELETED',
    entityType: 'AppExpense',
    entityId: id,
    description: `Deleted expense record ${expense.title}`,
    request,
  });
  return NextResponse.json({ success: true });
}
