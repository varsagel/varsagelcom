const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Test kullanıcısının var olup olmadığını kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@test.com' }
    });

    if (existingUser) {
      console.log('Test kullanıcısı zaten mevcut: test@test.com');
      return;
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Test kullanıcısı oluştur
    const user = await prisma.user.create({
      data: {
        email: 'test@test.com',
        password: hashedPassword,
        name: 'Test Kullanıcısı',
        phone: '+90 555 123 4567',
        location: 'İstanbul, Türkiye'
      }
    });

    console.log('Test kullanıcısı oluşturuldu:');
    console.log('Email: test@test.com');
    console.log('Şifre: 123456');
    console.log('Kullanıcı ID:', user.id);
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();