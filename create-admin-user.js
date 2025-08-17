const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const adminEmail = 'admin@varsagel.com';
    const adminPassword = 'admin123';
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('Admin kullanıcısı zaten mevcut:', adminEmail);
      return;
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin User',
        phone: '+90 555 123 4567'
      }
    });

    console.log('Admin kullanıcısı başarıyla oluşturuldu:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('User ID:', adminUser.id);
    
  } catch (error) {
    console.error('Admin kullanıcısı oluşturulurken hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();