import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PaymentStatus, PaymentMethod } from '@prisma/client';

// Helper to generate random dates within a range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper to generate random payment reference
function generatePaymentReference(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'PAY-';
  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function GET() {
  try {
    // Clean up existing payments first
    await prisma.payment.deleteMany({});
    
    const businesses = await prisma.business.findMany({
      take: 5,
    });
    
    const users = await prisma.user.findMany({
      take: 10,
    });
    
    const bundles = await prisma.bundle.findMany({
      take: 5,
    });
    
    if (businesses.length === 0 || users.length === 0) {
      return NextResponse.json({
        message: 'Seed failed: Need businesses and users data first',
        success: false
      });
    }
    
    // Payment statuses and methods
    const statuses: PaymentStatus[] = [PaymentStatus.PENDING, PaymentStatus.COMPLETED, PaymentStatus.FAILED, PaymentStatus.REFUNDED];
    const methods: PaymentMethod[] = [PaymentMethod.MOBILE_MONEY, PaymentMethod.CREDIT_CARD, PaymentMethod.PAYPAL, PaymentMethod.BANK_TRANSFER];
    const currencies = ['TZS', 'USD', 'EUR', 'GBP'];
    
    // Generate random payments
    const payments = [];
    const now = new Date();
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    // Generate 50 random payments
    for (let i = 0; i < 50; i++) {
      // Select random business, user, and bundle
      const business = businesses[Math.floor(Math.random() * businesses.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      // Some payments may not be associated with a bundle
      const bundle = Math.random() > 0.2 ? bundles[Math.floor(Math.random() * bundles.length)] : null;
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const method = methods[Math.floor(Math.random() * methods.length)];
      const currency = currencies[Math.floor(Math.random() * currencies.length)];
      
      // Random amount between 10 and 1000
      const amount = Math.floor(Math.random() * 990) + 10;
      
      // Random date in the last month
      const createdAt = randomDate(monthAgo, now);
      const updatedAt = new Date(createdAt);
      
      // If status is not pending, update time is a bit later
      if (status !== PaymentStatus.PENDING) {
        updatedAt.setMinutes(updatedAt.getMinutes() + Math.floor(Math.random() * 60));
      }
      
      payments.push({
        id: `payment-${i + 1}`,
        amount,
        currency,
        paymentReference: generatePaymentReference(),
        paymentStatus: status,
        paymentMethod: method,
        businessId: business.id,
        userId: user.id,
        bundleId: bundle?.id || bundles[0].id, // Use the first bundle as fallback
        createdAt,
        updatedAt
      });
    }
    
    // Create all payments
    const result = await prisma.payment.createMany({
      data: payments,
    });
    
    return NextResponse.json({
      message: `Successfully seeded ${result.count} payments`,
      success: true
    });
  } catch (error: any) {
    console.error('Error seeding payments:', error);
    return NextResponse.json({
      message: 'Failed to seed payments data',
      error: error.message,
      success: false
    }, { status: 500 });
  }
} 