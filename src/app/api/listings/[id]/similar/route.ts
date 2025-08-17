import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Önce mevcut ilanı al
    const currentListing = await prisma.listing.findUnique({
      where: { id },
      select: {
        category: true,
        subcategory: true,
        location: true,
        budgetMin: true,
        budgetMax: true,
      },
    });

    if (!currentListing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    // Benzer ilanları bul
    const similarListings = await prisma.listing.findMany({
      where: {
        AND: [
          { id: { not: id } }, // Mevcut ilanı hariç tut
          { status: 'active' }, // Sadece aktif ilanlar
          { expiresAt: { gt: new Date() } }, // Süresi dolmamış ilanlar
          {
            OR: [
              { category: currentListing.category }, // Aynı kategori
              { location: currentListing.location }, // Aynı lokasyon
              {
                AND: [
                  {
                    budgetMin: {
                      lte: currentListing.budgetMax || 999999,
                    },
                  },
                  {
                    budgetMax: {
                      gte: currentListing.budgetMin || 0,
                    },
                  },
                ],
              }, // Benzer bütçe aralığı
            ],
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        _count: {
          select: {
            offers: true,
            favorites: true,
          },
        },
      },
      orderBy: [
        // Önce aynı kategorideki ilanları getir
        {
          category: currentListing.category ? 'asc' : 'desc',
        },
        // Sonra en yeni ilanları
        {
          createdAt: 'desc',
        },
      ],
      take: 6, // En fazla 6 benzer ilan
    });

    // Verileri formatla
    const formattedListings = similarListings.map((listing) => {
      // Kalan süreyi hesapla
      const expiryDate = new Date(listing.expiresAt);
      const now = new Date();
      const timeDiff = expiryDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      let timeLeft = '';
      if (daysLeft > 0) {
        timeLeft = `${daysLeft} gün`;
      } else {
        timeLeft = 'Süresi dolmuş';
      }

      return {
        id: listing.id,
        title: listing.title,
        category: listing.category,
        location: listing.location,
        budget: `${listing.budgetMin?.toLocaleString('tr-TR') || '0'}-${listing.budgetMax?.toLocaleString('tr-TR') || '0'}`,
        offers: listing._count.offers,
        timeLeft,
        createdAt: listing.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      similarListings: formattedListings,
    });
  } catch (error) {
    console.error('Error fetching similar listings:', error);
    return NextResponse.json(
      { error: 'Benzer ilanlar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}