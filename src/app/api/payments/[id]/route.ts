import { NextRequest, NextResponse } from 'next/server';
import { mockPayments } from '@/lib/mockPayments';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Find the payment in mock data
    const payment = mockPayments.find(p => p.id === id);
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ payment });
  } catch (error: any) {
    console.error('Error fetching payment details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment details', details: error.message },
      { status: 500 }
    );
  }
} 