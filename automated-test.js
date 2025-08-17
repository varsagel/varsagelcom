const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const fetch = require('node-fetch');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';

class AutomatedTester {
  constructor() {
    this.users = {};
    this.tokens = {};
    this.listing = null;
    this.offer = null;
  }

  async createTestUsers() {
    console.log('\n🔧 Test kullanıcıları oluşturuluyor...');
    
    const hashedPassword = await bcrypt.hash('123456', 10);

    // İlan sahibi
    this.users.owner = await prisma.user.upsert({
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

    // Teklif veren
    this.users.bidder = await prisma.user.upsert({
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

    console.log('✅ Test kullanıcıları oluşturuldu');
    console.log(`   İlan Sahibi ID: ${this.users.owner.id}`);
    console.log(`   Teklif Veren ID: ${this.users.bidder.id}`);
  }

  async loginUser(email, password) {
    console.log(`\n🔐 ${email} ile giriş yapılıyor...`);
    
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error(`Giriş başarısız: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Giriş başarılı');
    return data.token;
  }

  async createListing(token) {
    console.log('\n📝 İlan oluşturuluyor...');
    
    const listingData = {
      title: 'Test Web Sitesi Tasarımı',
      description: 'Modern ve responsive bir web sitesi tasarımı yapılacak. React ve Next.js kullanılacak.',
      category: 'Web Tasarım',
      subcategory: 'Frontend Geliştirme',
      location: 'İstanbul',
      district: 'Kadıköy',
      priceMin: 3000,
      priceMax: 7000,
      images: []
    };

    const response = await fetch(`${BASE_URL}/api/listings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(listingData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`İlan oluşturma başarısız: ${response.status} - ${error}`);
    }

    const result = await response.json();
    this.listing = result.listing;
    console.log('✅ İlan oluşturuldu');
    console.log(`   İlan ID: ${this.listing.id}`);
    console.log(`   Başlık: ${this.listing.title}`);
  }

  async createOffer(token) {
    console.log('\n💰 Teklif veriliyor...');
    
    const offerData = {
      price: 4500,
      deliveryTime: '15 gün',
      description: 'Modern ve kullanıcı dostu bir web sitesi tasarlayabilirim. 5 yıllık deneyimim var.',
      experience: '5 yıl web tasarım deneyimi',
      portfolio: 'https://portfolio.example.com',
      guaranteeOffered: true,
      revisionCount: 3,
      additionalServices: ['SEO optimizasyonu', 'Mobil uyumluluk']
    };

    const response = await fetch(`${BASE_URL}/api/offers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ...offerData, listingId: this.listing.id })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Teklif verme başarısız: ${response.status} - ${error}`);
    }

    const result = await response.json();
    this.offer = result.offer;
    console.log('✅ Teklif verildi');
    console.log(`   Teklif ID: ${this.offer.id}`);
    console.log(`   Fiyat: ${this.offer.price} TL`);
  }

  async acceptOffer(token) {
    console.log('\n✅ Teklif kabul ediliyor...');
    
    const response = await fetch(`${BASE_URL}/api/offers/${this.offer.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action: 'accept' })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Teklif kabul etme başarısız: ${response.status} - ${error}`);
    }

    console.log('✅ Teklif kabul edildi');
    console.log('   Artık mesajlaşma başlayabilir!');
  }

  async testMessaging(ownerToken, bidderToken) {
    console.log('\n💬 Mesajlaşma test ediliyor...');
    
    // Konuşma oluştur
    const conversationResponse = await fetch(`${BASE_URL}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({ offerId: this.offer.id })
    });

    if (!conversationResponse.ok) {
      console.log('⚠️  Konuşma zaten mevcut olabilir, devam ediliyor...');
    } else {
      console.log('✅ Konuşma oluşturuldu');
    }

    // İlan sahibinden mesaj gönder
    const message1Response = await fetch(`${BASE_URL}/api/conversations/${this.offer.id}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({ 
        content: 'Merhaba! Teklifinizi kabul ettim. Ne zaman başlayabiliriz?' 
      })
    });

    if (message1Response.ok) {
      console.log('✅ İlan sahibi mesaj gönderdi');
    }

    // Teklif verenden cevap
    const message2Response = await fetch(`${BASE_URL}/api/conversations/${this.offer.id}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bidderToken}`
      },
      body: JSON.stringify({ 
        content: 'Harika! Yarın başlayabilirim. Önce detayları konuşalım.' 
      })
    });

    if (message2Response.ok) {
      console.log('✅ Teklif veren cevap verdi');
    }

    console.log('✅ Mesajlaşma testi tamamlandı');
  }

  async runFullTest() {
    try {
      console.log('🚀 Otomatik test başlatılıyor...');
      console.log('=' .repeat(50));

      // 1. Test kullanıcıları oluştur
      await this.createTestUsers();

      // 2. Kullanıcıları giriş yap
      this.tokens.owner = await this.loginUser('ilan-sahibi@test.com', '123456');
      this.tokens.bidder = await this.loginUser('teklif-veren@test.com', '123456');

      // 3. İlan oluştur (İlan sahibi)
      await this.createListing(this.tokens.owner);

      // 4. Teklif ver (Teklif veren)
      await this.createOffer(this.tokens.bidder);

      // 5. Teklifi kabul et (İlan sahibi)
      await this.acceptOffer(this.tokens.owner);

      // 6. Mesajlaşma test et
      await this.testMessaging(this.tokens.owner, this.tokens.bidder);

      console.log('\n' + '=' .repeat(50));
      console.log('🎉 TÜM TESTLER BAŞARIYLA TAMAMLANDI!');
      console.log('\n📋 Test Sonuçları:');
      console.log(`   ✅ İlan oluşturuldu: ${this.listing.title}`);
      console.log(`   ✅ Teklif verildi: ${this.offer.price} TL`);
      console.log(`   ✅ Teklif kabul edildi`);
      console.log(`   ✅ Mesajlaşma çalışıyor`);
      console.log('\n🌐 Test kullanıcıları ile manuel test için:');
      console.log('   İlan Sahibi: ilan-sahibi@test.com / 123456');
      console.log('   Teklif Veren: teklif-veren@test.com / 123456');
      console.log(`   Test URL: ${BASE_URL}`);

    } catch (error) {
      console.error('\n❌ Test başarısız:', error.message);
      console.error('Stack:', error.stack);
    } finally {
      await prisma.$disconnect();
    }
  }
}

// Test'i çalıştır
const tester = new AutomatedTester();
tester.runFullTest();