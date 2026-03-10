import { NextRequest, NextResponse } from 'next/server';
import { getFilteredPayments } from '@/lib/mockPayments';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const method = searchParams.get('method') || '';
    
    console.log('API request parameters:', { page, limit, search, status, method });
    
    // Get filtered and paginated payments from mock data
    const result = getFilteredPayments({
      page,
      limit,
      search,
      status,
      method
    });
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments', details: error.message },
      { status: 500 }
    );
  }
} 