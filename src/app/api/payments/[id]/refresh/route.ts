import { NextRequest, NextResponse } from 'next/server';
import { refreshPaymentStatus } from '@/lib/mockPayments';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Use mock implementation to refresh payment status
    const updatedPayment = refreshPaymentStatus(id);
    
    if (!updatedPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    // Return the updated payment
    return NextResponse.json({
      message: 'Payment status updated',
      payment: updatedPayment
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    );
  }
} 