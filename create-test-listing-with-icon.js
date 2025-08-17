const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function createTestListingWithIcon() {
  try {
    console.log('🔐 Giriş yapılıyor...');
    
    // Login
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: '123456'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Giriş başarılı');

    console.log('📝 Icon seçimli ilan oluşturuluyor...');
    
    // Create listing with icon
    const listingData = {
      title: 'Test BMW Satışı - Icon ile',
      description: 'BMW logosu ile test ilanı. Icon seçimi test ediliyor.',
      category: 'vasita',
      subcategory: 'Otomobil',
      location: 'İstanbul',
      district: 'Kadıköy',
      priceMin: 450000,
      priceMax: 500000,
      images: [],
      videoUrl: null,
      icon: 'bmw-logo.png', // Logo dosyası
      categorySpecificData: {
        brand: 'BMW',
        model: '320i',
        series: '3 Serisi',
        bodyType: 'Sedan',
        color: 'Siyah',
        year: '2018',
        km: '85000',
        fuel: 'Benzin',
        transmission: 'Otomatik'
      }
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

    const listing = await response.json();
    console.log('✅ İlan oluşturuldu');
    console.log(`   İlan ID: ${listing.listing.id}`);
    console.log(`   Başlık: ${listing.listing.title}`);
    console.log(`   Kategori: ${listing.listing.category}`);
    console.log(`   Alt Kategori: ${listing.listing.subcategory}`);
    console.log(`   Icon: ${listing.listing.icon}`);
    
    console.log(`\n🌐 İlanı görüntülemek için: ${BASE_URL}/listings/${listing.listing.id}`);
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

createTestListingWithIcon();