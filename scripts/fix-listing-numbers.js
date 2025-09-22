const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixListingNumbers() {
  try {
    console.log('İlan numaraları düzeltiliyor...');
    
    // Tüm ilanları al
    const listings = await prisma.listing.findMany({
      orderBy: { createdAt: 'asc' }
    });

    console.log(`Toplam ${listings.length} ilan bulundu.`);

    let updatedCount = 0;

    // Her ilan için geçerli bir listingNumber oluştur
    for (let i = 0; i < listings.length; i++) {
      const listing = listings[i];
      const currentNumber = parseInt(listing.listingNumber);
      
      // Eğer mevcut listingNumber geçerli değilse, yeni bir numara ata
      if (isNaN(currentNumber)) {
        const newListingNumber = (100000 + i).toString();
        
        await prisma.listing.update({
          where: { id: listing.id },
          data: { listingNumber: newListingNumber }
        });
        
        console.log(`İlan ${listing.id}: ${listing.listingNumber} -> ${newListingNumber}`);
        updatedCount++;
      }
    }

    console.log(`✅ ${updatedCount} ilan numarası güncellendi.`);

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixListingNumbers();