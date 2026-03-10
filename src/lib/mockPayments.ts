// Mock payments data for testing
const now = new Date();
const yesterday = new Date(now);
yesterday.setDate(yesterday.getDate() - 1);
const lastWeek = new Date(now);
lastWeek.setDate(lastWeek.getDate() - 7);

export const mockPayments = [
  {
    id: 'payment-1',
    amount: 50000,
    currency: 'TZS',
    paymentReference: 'PAY-ABC123DEF456',
    paymentStatus: 'COMPLETED',
    paymentMethod: 'MOBILE_MONEY',
    createdAt: lastWeek.toISOString(),
    updatedAt: lastWeek.toISOString(),
    business: {
      id: 'business-1',
      name: 'Serengeti Safari Lodge'
    },
    user: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john.doe@example.com'
    },
    bundle: {
      id: 'bundle-1',
      name: 'Premium',
      price: 50000
    }
  },
  {
    id: 'payment-2',
    amount: 20000,
    currency: 'TZS',
    paymentReference: 'PAY-GHI789JKL012',
    paymentStatus: 'PENDING',
    paymentMethod: 'CREDIT_CARD',
    createdAt: yesterday.toISOString(),
    updatedAt: yesterday.toISOString(),
    business: {
      id: 'business-2',
      name: 'Zanzibar Beach Resort'
    },
    user: {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com'
    },
    bundle: {
      id: 'bundle-2',
      name: 'Standard',
      price: 20000
    }
  },
  {
    id: 'payment-3',
    amount: 35000,
    currency: 'TZS',
    paymentReference: 'PAY-MNO345PQR678',
    paymentStatus: 'FAILED',
    paymentMethod: 'BANK_TRANSFER',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    business: {
      id: 'business-3',
      name: 'Kilimanjaro Tours'
    },
    user: {
      id: 'user-3',
      name: 'David Williams',
      email: 'david.williams@example.com'
    },
    bundle: {
      id: 'bundle-3',
      name: 'Premium',
      price: 35000
    }
  },
  {
    id: 'payment-4',
    amount: 0,
    currency: 'TZS',
    paymentReference: 'PAY-STU901VWX234',
    paymentStatus: 'COMPLETED',
    paymentMethod: 'MOBILE_MONEY',
    createdAt: lastWeek.toISOString(),
    updatedAt: lastWeek.toISOString(),
    business: {
      id: 'business-4',
      name: 'Dar es Salaam Cafe'
    },
    user: {
      id: 'user-4',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com'
    },
    bundle: {
      id: 'bundle-4',
      name: 'Free',
      price: 0
    }
  },
  {
    id: 'payment-5',
    amount: 50000,
    currency: 'TZS',
    paymentReference: 'PAY-YZA567BCD890',
    paymentStatus: 'REFUNDED',
    paymentMethod: 'PAYPAL',
    createdAt: yesterday.toISOString(),
    updatedAt: now.toISOString(),
    business: {
      id: 'business-5',
      name: 'Arusha Tech Solutions'
    },
    user: {
      id: 'user-5',
      name: 'Michael Brown',
      email: 'michael.brown@example.com'
    },
    bundle: {
      id: 'bundle-5',
      name: 'Premium',
      price: 50000
    }
  }
];

// Mock function to filter and paginate payments
export function getFilteredPayments({
  page = 1,
  limit = 10,
  search = '',
  status = '',
  method = ''
}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  method?: string;
}) {
  let filteredPayments = [...mockPayments];
  
  // Apply status filter
  if (status) {
    filteredPayments = filteredPayments.filter(
      payment => payment.paymentStatus === status
    );
  }
  
  // Apply method filter
  if (method) {
    filteredPayments = filteredPayments.filter(
      payment => payment.paymentMethod === method
    );
  }
  
  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredPayments = filteredPayments.filter(
      payment =>
        payment.paymentReference?.toLowerCase().includes(searchLower) ||
        payment.business.name.toLowerCase().includes(searchLower) ||
        payment.user.name?.toLowerCase().includes(searchLower) ||
        payment.user.email.toLowerCase().includes(searchLower)
    );
  }
  
  // Get total count
  const total = filteredPayments.length;
  
  // Apply pagination
  const offset = (page - 1) * limit;
  const paginatedPayments = filteredPayments.slice(offset, offset + limit);
  
  return {
    payments: paginatedPayments,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

// Function to refresh the status of a payment
export function refreshPaymentStatus(id: string) {
  const paymentIndex = mockPayments.findIndex(payment => payment.id === id);
  
  if (paymentIndex === -1) {
    return null;
  }
  
  const payment = mockPayments[paymentIndex];
  
  if (payment.paymentStatus === 'PENDING') {
    // Randomly change the status to COMPLETED or FAILED
    const randomStatus = Math.random() > 0.5 ? 'COMPLETED' : 'FAILED';
    
    // Update the payment in our mock data
    mockPayments[paymentIndex] = {
      ...payment,
      paymentStatus: randomStatus,
      updatedAt: new Date().toISOString()
    };
  }
  
  return mockPayments[paymentIndex];
} 