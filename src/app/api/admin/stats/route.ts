
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Admin istatistiklerini getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin kontrolü yapılabilir (şimdilik tüm giriş yapmış kullanıcılar admin)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Son 30 günün tarihi
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Paralel olarak tüm istatistikleri getir
    const [
      totalUsers,
      totalListings,
      totalOffers,
      totalMessages,
      totalNotifications,
      recentUsers,
      recentListings,
      recentOffers
    ] = await Promise.all([
      // Toplam sayılar
      prisma.user.count(),
      prisma.listing.count(),
      prisma.offer.count(),
      prisma.message.count(),
      prisma.notification.count(),
      
      // Son 30 gündeki sayılar
      prisma.user.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      prisma.listing.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      prisma.offer.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      })
    ]);

    const stats = {
      totalUsers,
      totalListings,
      totalOffers,
      totalMessages,
      totalNotifications,
      recentUsers,
      recentListings,
      recentOffers
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Admin istatistikleri getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}