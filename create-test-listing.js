const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:3000';

async function createTestListing() {
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

    console.log('📝 Marka ve model bilgili ilan oluşturuluyor...');
    
    // Create listing with brand and model
    const listingData = {
      title: 'Test Araba Satışı - BMW 320i',
      description: 'Temiz kullanılmış BMW 320i satılık. Hasar kaydı yok.',
      category: 'Otomobil',
      subcategory: 'Sedan',
      location: 'İstanbul',
      district: 'Kadıköy',
      priceMin: 450000,
      priceMax: 500000,
      images: [],
      videoUrl: null,
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
    console.log(`   CategorySpecificData: ${JSON.stringify(listing.listing.categorySpecificData)}`);
    
    // Parse categorySpecificData if it's a string
    let parsedData = listing.listing.categorySpecificData;
    if (typeof parsedData === 'string') {
      try {
        parsedData = JSON.parse(parsedData);
      } catch (e) {
        console.log('   Parse hatası:', e.message);
      }
    }
    
    console.log(`   Marka: ${parsedData?.brand || 'Belirtilmemiş'}`);
    console.log(`   Model: ${parsedData?.model || 'Belirtilmemiş'}`);
    console.log(`   Seri: ${parsedData?.series || 'Belirtilmemiş'}`);
    console.log(`   Kasa Tipi: ${parsedData?.bodyType || 'Belirtilmemiş'}`);
    console.log(`   Renk: ${parsedData?.color || 'Belirtilmemiş'}`);
    
    console.log(`\n🌐 İlanı görüntülemek için: ${BASE_URL}/listings/${listing.listing.id}`);
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

createTestListing();