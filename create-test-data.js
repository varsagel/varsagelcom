const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Test verisi oluşturuluyor...');
  
  // Test kullanıcıları oluştur
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const user1 = await prisma.user.create({
    data: {
      email: 'ilan-sahibi@test.com',
      password: hashedPassword,
      name: 'İlan Sahibi',
      phone: '05551234567',
      location: 'İstanbul'
    }
  });
  
  const user2 = await prisma.user.create({
    data: {
      email: 'teklif-veren@test.com',
      password: hashedPassword,
      name: 'Teklif Veren',
      phone: '05559876543',
      location: 'Ankara'
    }
  });
  
  console.log('👥 Kullanıcılar oluşturuldu:', user1.id, user2.id);
  
  // Test ilanı oluştur
  const listing = await prisma.listing.create({
    data: {
      title: 'Test İlanı - Web Sitesi Tasarımı',
      description: 'Modern ve responsive web sitesi tasarımı yapılacak.',
      category: 'teknoloji',
      subcategory: 'web-tasarim',
      location: 'İstanbul',
      district: 'Kadıköy',
      budgetMin: 5000,
      budgetMax: 10000,
      images: JSON.stringify(['test1.jpg', 'test2.jpg']),
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün sonra
      userId: user1.id
    }
  });
  
  console.log('📋 İlan oluşturuldu:', listing.id);
  
  // Test teklifi oluştur
  const offer = await prisma.offer.create({
    data: {
      price: 7500,
      duration: '2 hafta',
      message: 'Bu proje için deneyimim var, kaliteli bir çalışma yapabilirim.',
      experience: '5 yıl web tasarım deneyimi',
      portfolio: 'https://portfolio.example.com',
      guaranteeOffered: true,
      revisionCount: 3,
      additionalServices: JSON.stringify([]),
      status: 'pending',
      userId: user2.id,
      listingId: listing.id
    }
  });
  
  console.log('💼 Teklif oluşturuldu:', offer.id);
  console.log('✅ Test verisi başarıyla oluşturuldu!');
  console.log('🔗 Teklif URL: http://localhost:3000/offers/' + offer.id);
  console.log('👤 İlan sahibi email: ilan-sahibi@test.com');
  console.log('👤 Teklif veren email: teklif-veren@test.com');
  console.log('🔑 Her iki kullanıcı için şifre: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });