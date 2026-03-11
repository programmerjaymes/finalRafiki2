'use server';

import { prisma } from '@/lib/prisma';
import { User } from '@/components/admin/businessess/types';

export async function fetchUsers(): Promise<User[]> {
  try {
    console.log('🔍 [Server Action] Fetching users from database...');
    const startTime = Date.now();
    
    // Fetch users directly from database using Prisma
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    const endTime = Date.now();
    
    console.log(`✅ [Server Action] Successfully fetched ${users.length} users in ${endTime - startTime}ms`);
    console.log('📊 [Server Action] Raw users data:', JSON.stringify(users, null, 2));
    console.log('📊 [Server Action] User roles breakdown:', users.reduce((acc, user) => {
      const role = user.role || 'no-role';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>));
    
    // Filter to show only business owners or users with appropriate roles
    const allowedRoles = ['BUSINESS_OWNER', 'ADMIN', 'SUPER_ADMIN'];
    const businessOwners = users.filter(user => 
      !user.role || allowedRoles.includes(user.role)
    );
    
    console.log(`👥 [Server Action] Filtered to ${businessOwners.length} potential business owners`);
    console.log('👥 [Server Action] Business owners:', businessOwners.map(u => `${u.name} (${u.email}) - ${u.role || 'no-role'}`));
    
    return businessOwners as User[];
  } catch (error) {
    console.error('❌ [Server Action] Error fetching users:', error);
    return [];
  }
}
