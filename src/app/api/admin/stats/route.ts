import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserIdFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

// Admin yetkilerini kontrol eden email listesi
const ADMIN_EMAILS = [
  'admin@varsagel.com',
];

export async function GET(request: NextRequest) {
  try {
    // Token'dan kullanıcı ID'sini al
    const userId = await getUserIdFromToken(request.headers);
    
    // Kullanıcıyı veritabanından getir ve admin yetkisi kontrol et
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json(
        { error: 'Admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    // Bugünün başlangıcı
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Paralel olarak tüm istatistikleri getir
    const [
      totalUsers,
      totalListings,
      totalOffers,
      totalViews,
      totalFavorites,
      totalReviews,
      activeListings,
      pendingOffers,
      todayRegistrations,
      todayListings,
      averageRatingData,
      totalRevenueData
    ] = await Promise.all([
      // Toplam kullanıcı sayısı
      prisma.user.count(),
      
      // Toplam ilan sayısı
      prisma.listing.count(),
      
      // Toplam teklif sayısı
      prisma.offer.count(),
      
      // Toplam görüntülenme sayısı
      prisma.listingView.count(),
      
      // Toplam favori sayısı
      prisma.favorite.count(),
      
      // Toplam yorum sayısı
      prisma.review.count(),
      
      // Aktif ilan sayısı
      prisma.listing.count({
        where: {
          status: 'active',
          expiresAt: {
            gt: new Date()
          }
        }
      }),
      
      // Bekleyen teklif sayısı
      prisma.offer.count({
        where: {
          status: 'pending'
        }
      }),
      
      // Bugün kayıt olan kullanıcı sayısı
      prisma.user.count({
        where: {
          createdAt: {
            gte: today
          }
        }
      }),
      
      // Bugün oluşturulan ilan sayısı
      prisma.listing.count({
        where: {
          createdAt: {
            gte: today
          }
        }
      }),
      
      // Ortalama puan
      prisma.review.aggregate({
        _avg: {
          rating: true
        }
      }),
      
      // Toplam işlem hacmi (kabul edilen tekliflerin toplam değeri)
      prisma.offer.aggregate({
        where: {
          status: 'accepted'
        },
        _sum: {
          price: true
        }
      })
    ]);

    const stats = {
      totalUsers,
      totalListings,
      totalOffers,
      totalViews,
      totalFavorites,
      totalReviews,
      activeListings,
      pendingOffers,
      todayRegistrations,
      todayListings,
      averageRating: averageRatingData._avg.rating || 0,
      totalRevenue: totalRevenueData._sum.price || 0,
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'İstatistikler alınırken hata oluştu' },
      { status: 500 }
    );
  }
}