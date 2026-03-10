// Mock users data for testing
const now = new Date();
const lastMonth = new Date(now);
lastMonth.setMonth(lastMonth.getMonth() - 1);
const lastYear = new Date(now);
lastYear.setFullYear(lastYear.getFullYear() - 1);

export interface MockUser {
  id: string;
  name: string;
  email: string;
  hashedPassword?: string;
  emailVerified: string | null;
  image: string | null;
  role: 'ADMIN' | 'BUSINESS_OWNER' | 'BUSINESS_REGISTRAR' | 'ACCOUNTANT';
  createdAt: string;
  updatedAt: string;
  businesses?: {
    id: string;
    name: string;
  }[];
  registeredBusinesses?: {
    id: string;
    name: string;
  }[];
  payments?: {
    id: string;
    amount: number;
    paymentStatus: string;
  }[];
}

export const mockUsers: MockUser[] = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    hashedPassword: '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXX',
    emailVerified: now.toISOString(),
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
    role: 'ADMIN',
    createdAt: lastYear.toISOString(),
    updatedAt: now.toISOString(),
    businesses: [
      { id: 'business-1', name: 'Serengeti Safari Lodge' },
      { id: 'business-3', name: 'Kilimanjaro Tours' }
    ],
    payments: [
      { id: 'payment-1', amount: 50000, paymentStatus: 'COMPLETED' },
      { id: 'payment-3', amount: 35000, paymentStatus: 'FAILED' }
    ]
  },
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    hashedPassword: '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXX',
    emailVerified: lastMonth.toISOString(),
    image: 'https://randomuser.me/api/portraits/women/2.jpg',
    role: 'BUSINESS_OWNER',
    createdAt: lastMonth.toISOString(),
    updatedAt: now.toISOString(),
    businesses: [
      { id: 'business-2', name: 'Zanzibar Beach Resort' }
    ],
    payments: [
      { id: 'payment-2', amount: 20000, paymentStatus: 'PENDING' }
    ]
  },
  {
    id: 'user-3',
    name: 'David Williams',
    email: 'david.williams@example.com',
    hashedPassword: '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXX',
    emailVerified: null,
    image: null,
    role: 'BUSINESS_REGISTRAR',
    createdAt: lastMonth.toISOString(),
    updatedAt: lastMonth.toISOString(),
    registeredBusinesses: [
      { id: 'business-1', name: 'Serengeti Safari Lodge' },
      { id: 'business-2', name: 'Zanzibar Beach Resort' }
    ]
  },
  {
    id: 'user-4',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    hashedPassword: '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXX',
    emailVerified: now.toISOString(),
    image: 'https://randomuser.me/api/portraits/women/4.jpg',
    role: 'ACCOUNTANT',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    payments: [
      { id: 'payment-4', amount: 0, paymentStatus: 'COMPLETED' }
    ]
  },
  {
    id: 'user-5',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    hashedPassword: '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXX',
    emailVerified: lastYear.toISOString(),
    image: 'https://randomuser.me/api/portraits/men/5.jpg',
    role: 'BUSINESS_OWNER',
    createdAt: lastYear.toISOString(),
    updatedAt: lastMonth.toISOString(),
    businesses: [
      { id: 'business-5', name: 'Arusha Tech Solutions' }
    ],
    payments: [
      { id: 'payment-5', amount: 50000, paymentStatus: 'REFUNDED' }
    ]
  }
];

// Mock function to filter and paginate users
export function getFilteredUsers({
  page = 1,
  limit = 10,
  search = '',
  role = ''
}: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) {
  let filteredUsers = [...mockUsers];
  
  // Apply role filter
  if (role) {
    filteredUsers = filteredUsers.filter(
      user => user.role === role
    );
  }
  
  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredUsers = filteredUsers.filter(
      user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
    );
  }
  
  // Get total count
  const total = filteredUsers.length;
  
  // Apply pagination
  const offset = (page - 1) * limit;
  const paginatedUsers = filteredUsers.slice(offset, offset + limit);
  
  return {
    users: paginatedUsers,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

// Get user by ID
export function getUserById(id: string) {
  return mockUsers.find(user => user.id === id) || null;
}

// Create a new user
export function createUser(userData: {
  name: string;
  email: string;
  role: 'ADMIN' | 'BUSINESS_OWNER' | 'BUSINESS_REGISTRAR' | 'ACCOUNTANT';
  password?: string;
}) {
  // Check if email is already in use
  const existingUser = mockUsers.find(user => user.email === userData.email);
  if (existingUser) {
    throw new Error('Email already in use');
  }

  // Create new user with mock ID
  const newUser: MockUser = {
    id: `user-${mockUsers.length + 1}`,
    name: userData.name,
    email: userData.email,
    hashedPassword: userData.password ? '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXX' : undefined,
    emailVerified: null,
    image: null,
    role: userData.role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Add to mock data
  mockUsers.push(newUser);

  // Return the created user (without password)
  const { hashedPassword, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}

// Update user
export function updateUser(
  id: string,
  userData: {
    name?: string;
    email?: string;
    role?: 'ADMIN' | 'BUSINESS_OWNER' | 'BUSINESS_REGISTRAR' | 'ACCOUNTANT';
    password?: string;
  }
) {
  // Find user index
  const userIndex = mockUsers.findIndex(user => user.id === id);
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  // Check if email is already in use by another user
  if (userData.email) {
    const existingUser = mockUsers.find(user => user.email === userData.email && user.id !== id);
    if (existingUser) {
      throw new Error('Email already in use');
    }
  }

  // Update user
  const updatedUser: MockUser = {
    ...mockUsers[userIndex],
    ...userData,
    updatedAt: new Date().toISOString()
  };

  // Update password if provided
  if (userData.password) {
    updatedUser.hashedPassword = '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXX';
  }

  // Update in mock data
  mockUsers[userIndex] = updatedUser;

  // Return the updated user (without password)
  const { hashedPassword, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
}

// Delete user
export function deleteUser(id: string) {
  const userIndex = mockUsers.findIndex(user => user.id === id);
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  // Remove from mock data
  mockUsers.splice(userIndex, 1);
  return true;
} 