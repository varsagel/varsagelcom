const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@test.com' }
    });

    if (existingUser) {
      console.log('Test kullanıcısı zaten mevcut:', existingUser.email);
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    const user = await prisma.user.create({
      data: {
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        password: hashedPassword,
        isActive: true,
      }
    });

    console.log('Test kullanıcısı oluşturuldu:', user.email);
    console.log('Email: test@test.com');
    console.log('Password: 123456');
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();