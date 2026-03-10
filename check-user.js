const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const email = 'admin@rafiki.com';
    const password = 'Tehama@2025';
    
    console.log('Checking user:', email);
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        hashedPassword: true,
      },
    });
    
    if (!user) {
      console.log('❌ User not found in database');
      return;
    }
    
    console.log('✅ User found:');
    console.log('  - ID:', user.id);
    console.log('  - Name:', user.name);
    console.log('  - Email:', user.email);
    console.log('  - Role:', user.role);
    console.log('  - Has password:', !!user.hashedPassword);
    
    if (user.hashedPassword) {
      const isValid = await bcrypt.compare(password, user.hashedPassword);
      console.log('  - Password valid:', isValid ? '✅ YES' : '❌ NO');
      
      if (!isValid) {
        console.log('\n🔍 Testing password without trailing dot...');
        const isValidAlt = await bcrypt.compare('Admin@123', user.hashedPassword);
        console.log('  - Password "Admin@123" valid:', isValidAlt ? '✅ YES' : '❌ NO');
      }
    } else {
      console.log('❌ User has no password set');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
