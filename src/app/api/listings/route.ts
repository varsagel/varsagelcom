import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Tüm ilanları getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filtreleme parametreleri
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const searchTerm = searchParams.get('q') || searchParams.get('search') || searchParams.get('searchTerm');
    const displayNumber = searchParams.get('displayNumber');
    const minBudget = searchParams.get('minBudget');
    const maxBudget = searchParams.get('maxBudget');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Filtreleme koşulları
    const where: any = {
      status: 'active', // Sadece aktif ilanları getir
      // Kabul edilen teklifi olmayan ilanları getir
      offers: {
        none: {
          status: 'accepted'
        }
      }
    };
    
    if (category) {
      // Genel kategori kontrolü - eğer kategori genel bir kategori ise alt kategorileri de dahil et
      const generalCategories = {
        'Emlak': ['Konut', 'İş Yeri', 'Arsa', 'Bina', 'Devre Mülk', 'Diğer'],
        'Vasıta': ['Otomobil', 'Arazi, SUV & Pickup', 'Motosiklet', 'Minivan & Panelvan', 'Kamyon & Kamyonet', 'Otobüs & Midibüs', 'Tarım Makineleri', 'İş Makineleri', 'Deniz Araçları', 'Hava Araçları', 'ATV', 'UTV', 'Karavan', 'Treyler', 'Elektrikli Araçlar', 'Hasarlı Araçlar', 'Klasik Araçlar', 'Modifiye Araçlar', 'Diğer'],
        'Yedek Parça, Aksesuar, Donanım & Tuning': ['Otomotiv Ekipmanları', 'Motosiklet Ekipmanları', 'Deniz Aracı Ekipmanları', 'Hava Aracı Ekipmanları', 'ATV Ekipmanları', 'Karavan Ekipmanları', 'Diğer'],
        'İkinci El ve Sıfır Alışveriş': ['Bilgisayar', 'Cep Telefonu', 'Fotoğraf & Kamera', 'Ev Dekorasyon', 'Ev Elektroniği', 'Elektrikli Ev Aletleri', 'Giyim & Aksesuar', 'Saat', 'Anne & Bebek', 'Kişisel Bakım & Kozmetik', 'Hobi & Oyuncak', 'Oyun & Konsol', 'Kitap, Dergi & Film', 'Müzik', 'Spor', 'Takı, Mücevher & Altın', 'Koleksiyon', 'Antika', 'Bahçe & Yapı Market', 'Teknik Elektronik', 'Ofis & Kırtasiye', 'Yiyecek & İçecek', 'Diğer Her Şey'],
        'İş Makineleri & Sanayi': ['Tarım Makineleri', 'İş Makinesi', 'Sanayi', 'Elektrik & Enerji', 'Diğer'],
        'Ustalar ve Hizmetler': ['Tadilat & Dekorasyon', 'Nakliye', 'Temizlik', 'Güvenlik', 'Sağlık & Güzellik', 'Düğün & Organizasyon', 'Fotoğraf & Video', 'Bilgisayar & İnternet', 'Eğitim & Kurs', 'Diğer Hizmetler'],
        'Özel Ders Verenler': ['Lise', 'Üniversite', 'İlkokul', 'Ortaokul', 'Dil Dersleri', 'Bilgisayar', 'Müzik', 'Spor', 'Sanat', 'Diğer'],
        'İş İlanları': ['Satış', 'Pazarlama', 'Muhasebe & Finans', 'İnsan Kaynakları', 'Bilgi İşlem', 'Mühendislik', 'Sağlık', 'Eğitim', 'Turizm & Otelcilik', 'İnşaat', 'Üretim', 'Lojistik', 'Güvenlik', 'Temizlik', 'Diğer'],
        'Yardımcı Arayanlar': ['Ev İşleri', 'Çocuk Bakımı', 'Yaşlı Bakımı', 'Hasta Bakımı', 'Evcil Hayvan Bakımı', 'Bahçıvanlık', 'Şoförlük', 'Diğer'],
        'Hayvanlar Alemi': ['Evcil Hayvanlar', 'Çiftlik Hayvanları', 'Aksesuarlar', 'Yem ve Mama', 'Sağlık Ürünleri', 'Diğer']
      };
      
      // Eğer seçilen kategori genel kategorilerden biriyse, alt kategorileri de dahil et
      if (generalCategories[category]) {
        where.category = {
          in: [category, ...generalCategories[category]]
        };
      } else {
        // Spesifik kategori ise sadece o kategoriyi getir
        where.category = category;
      }
    }
    
    if (location) {
      where.location = location;
    }
    
    // DisplayNumber ile arama
    if (displayNumber) {
      where.displayNumber = displayNumber;
    } else if (searchTerm) {
      where.OR = [
        {
          title: {
            contains: searchTerm
          }
        },
        {
          description: {
            contains: searchTerm
          }
        }
      ];
    }
    
    if (minBudget || maxBudget) {
      where.AND = where.AND || [];
      
      if (minBudget) {
        where.AND.push({
          budgetMax: {
            gte: parseFloat(minBudget)
          }
        });
      }
      
      if (maxBudget) {
        where.AND.push({
          budgetMin: {
            lte: parseFloat(maxBudget)
          }
        });
      }
    }
    
    // Sıralama seçenekleri
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;
    
    // Sayfalama
    const skip = (page - 1) * limit;
    
    // İlanları getir
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              rating: true,
              reviewCount: true,
            },
          },
          _count: {
            select: {
              offers: true,
              favorites: true,
            },
          },
        },
      }),
      prisma.listing.count({ where }),
    ]);
    
    // Toplam sayfa sayısı
    const totalPages = Math.ceil(total / limit);
    
    // Images alanını JSON'dan array'e dönüştür
    const formattedListings = listings.map(listing => ({
      ...listing,
      images: listing.images ? JSON.parse(listing.images) : []
    }));
    
    return NextResponse.json({
      listings: formattedListings,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching listings' },
      { status: 500 }
    );
  }
}