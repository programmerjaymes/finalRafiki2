const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function updatePassword() {
  try {
    const email = 'admin@rafiki.com';
    const newPassword = 'Tehama@2025';
    
    console.log('Updating password for:', email);
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { hashedPassword },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    
    console.log('✅ Password updated successfully!');
    console.log('User:', updatedUser);
    
    const isValid = await bcrypt.compare(newPassword, hashedPassword);
    console.log('✅ Password verification:', isValid ? 'PASSED' : 'FAILED');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

updatePassword();
