const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTwoTestUsers() {
  try {
    // Şifreleri hash'le
    const hashedPassword = await bcrypt.hash('123456', 10);

    // İlk kullanıcı - İlan sahibi
    const user1 = await prisma.user.upsert({
      where: { email: 'ilan-sahibi@test.com' },
      update: {},
      create: {
        email: 'ilan-sahibi@test.com',
        password: hashedPassword,
        name: 'İlan Sahibi',
        phone: '+90 555 111 1111',
        location: 'İstanbul, Kadıköy'
      }
    });

    // İkinci kullanıcı - Teklif veren
    const user2 = await prisma.user.upsert({
      where: { email: 'teklif-veren@test.com' },
      update: {},
      create: {
        email: 'teklif-veren@test.com',
        password: hashedPassword,
        name: 'Teklif Veren',
        phone: '+90 555 222 2222',
        location: 'İstanbul, Beşiktaş'
      }
    });

    console.log('\n=== Test Kullanıcıları Oluşturuldu ===');
    console.log('\n1. İlan Sahibi:');
    console.log('   Email: ilan-sahibi@test.com');
    console.log('   Şifre: 123456');
    console.log('   ID:', user1.id);
    
    console.log('\n2. Teklif Veren:');
    console.log('   Email: teklif-veren@test.com');
    console.log('   Şifre: 123456');
    console.log('   ID:', user2.id);
    
    console.log('\n=== Test Senaryosu ===');
    console.log('1. İlan sahibi ile giriş yap ve ilan oluştur');
    console.log('2. Teklif veren ile giriş yap ve ilana teklif ver');
    console.log('3. İlan sahibi ile giriş yap ve teklifi kabul et');
    console.log('4. Her iki kullanıcı da mesajlaşma sayfasına erişebilir');
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTwoTestUsers();