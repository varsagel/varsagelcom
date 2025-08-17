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

    // Son 24 saat içindeki aktiviteleri getir
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Paralel olarak son aktiviteleri getir
    const [
      recentUsers,
      recentListings,
      recentOffers,
      recentReviews
    ] = await Promise.all([
      // Son kayıt olan kullanıcılar
      prisma.user.findMany({
        where: {
          createdAt: {
            gte: last24Hours
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      }),
      
      // Son oluşturulan ilanlar
      prisma.listing.findMany({
        where: {
          createdAt: {
            gte: last24Hours
          }
        },
        select: {
          id: true,
          title: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      }),
      
      // Son verilen teklifler
      prisma.offer.findMany({
        where: {
          createdAt: {
            gte: last24Hours
          }
        },
        select: {
          id: true,
          price: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true
            }
          },
          listing: {
            select: {
              title: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      }),
      
      // Son eklenen yorumlar
      prisma.review.findMany({
        where: {
          createdAt: {
            gte: last24Hours
          }
        },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          reviewer: {
            select: {
              name: true,
              email: true
            }
          },
          user: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      })
    ]);

    // Aktiviteleri birleştir ve sırala
    const activities = [
      ...recentUsers.map(user => ({
        id: `user-${user.id}`,
        type: 'user_registration' as const,
        description: `Yeni kullanıcı kaydı: ${user.name}`,
        timestamp: user.createdAt.toISOString(),
        user: {
          name: user.name,
          email: user.email
        }
      })),
      
      ...recentListings.map(listing => ({
        id: `listing-${listing.id}`,
        type: 'listing_created' as const,
        description: `Yeni ilan oluşturuldu: ${listing.title}`,
        timestamp: listing.createdAt.toISOString(),
        user: {
          name: listing.user.name,
          email: listing.user.email
        }
      })),
      
      ...recentOffers.map(offer => ({
        id: `offer-${offer.id}`,
        type: 'offer_made' as const,
        description: `"${offer.listing.title}" ilanına ${offer.price.toLocaleString('tr-TR')} TL teklif verildi`,
        timestamp: offer.createdAt.toISOString(),
        user: {
          name: offer.user.name,
          email: offer.user.email
        }
      })),
      
      ...recentReviews.map(review => ({
        id: `review-${review.id}`,
        type: 'review_added' as const,
        description: `${review.user.name} kullanıcısına ${review.rating} yıldız değerlendirme yapıldı`,
        timestamp: review.createdAt.toISOString(),
        user: {
          name: review.reviewer.name,
          email: review.reviewer.email
        }
      }))
    ];

    // Zamana göre sırala (en yeni önce)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // En son 20 aktiviteyi al
    const limitedActivities = activities.slice(0, 20);

    return NextResponse.json({
      success: true,
      activities: limitedActivities,
    });
  } catch (error) {
    console.error('Admin activity error:', error);
    return NextResponse.json(
      { error: 'Aktiviteler alınırken hata oluştu' },
      { status: 500 }
    );
  }
}