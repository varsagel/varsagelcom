import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAILS = ['admin@varsagel.com'];

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

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Tarih aralığını hesapla
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Kullanıcı kayıtları
    const userRegistrations = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // İlan oluşturmaları
    const listingCreations = await prisma.listing.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Teklif aktivitesi
    const offerActivity = await prisma.offer.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Kategori dağılımı
    const categoryDistribution = await prisma.listing.groupBy({
      by: ['category'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    // En aktif kullanıcılar
    const topUsers = await prisma.user.findMany({
      select: {
        name: true,
        email: true,
        _count: {
          select: {
            listings: true,
            offers: true
          }
        }
      },
      orderBy: {
        listings: {
          _count: 'desc'
        }
      },
      take: 10
    });

    // En popüler ilanlar
    const topListings = await prisma.listing.findMany({
      select: {
        title: true,
        price: true,
        _count: {
          select: {
            views: true,
            offers: true
          }
        }
      },
      orderBy: {
        views: {
          _count: 'desc'
        }
      },
      take: 10
    });

    // Gelir verileri (komisyon hesaplaması)
    const completedOffers = await prisma.offer.findMany({
      where: {
        status: 'ACCEPTED',
        createdAt: {
          gte: startDate
        }
      },
      include: {
        listing: {
          select: {
            price: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Tarih formatları için yardımcı fonksiyon
    const formatDateForChart = (date: Date) => {
      if (range === '7d') {
        return date.toLocaleDateString('tr-TR', { weekday: 'short' });
      } else if (range === '30d') {
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
      } else if (range === '90d') {
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
      } else {
        return date.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });
      }
    };

    // Günlük verileri grupla
    const groupByDay = (data: any[], dateField: string = 'createdAt') => {
      const grouped = new Map();
      
      // Tarih aralığındaki tüm günleri başlat
      const current = new Date(startDate);
      while (current <= now) {
        const key = current.toDateString();
        grouped.set(key, 0);
        current.setDate(current.getDate() + 1);
      }
      
      // Verileri grupla
      data.forEach(item => {
        const date = new Date(item[dateField]);
        const key = date.toDateString();
        grouped.set(key, (grouped.get(key) || 0) + (item._count?.id || 1));
      });
      
      const labels: string[] = [];
      const values: number[] = [];
      
      grouped.forEach((value, key) => {
        labels.push(formatDateForChart(new Date(key)));
        values.push(value);
      });
      
      return { labels, data: values };
    };

    // Gelir verilerini grupla
    const groupRevenueByDay = () => {
      const grouped = new Map();
      const commissionRate = 0.05; // %5 komisyon
      
      // Tarih aralığındaki tüm günleri başlat
      const current = new Date(startDate);
      while (current <= now) {
        const key = current.toDateString();
        grouped.set(key, 0);
        current.setDate(current.getDate() + 1);
      }
      
      // Gelir verilerini grupla
      completedOffers.forEach(offer => {
        const date = new Date(offer.createdAt);
        const key = date.toDateString();
        const commission = offer.amount * commissionRate;
        grouped.set(key, (grouped.get(key) || 0) + commission);
      });
      
      const labels: string[] = [];
      const values: number[] = [];
      
      grouped.forEach((value, key) => {
        labels.push(formatDateForChart(new Date(key)));
        values.push(Math.round(value));
      });
      
      return { labels, data: values };
    };

    const reports = {
      userRegistrations: groupByDay(userRegistrations),
      listingCreations: groupByDay(listingCreations),
      offerActivity: groupByDay(offerActivity),
      categoryDistribution: {
        labels: categoryDistribution.map(item => item.category || 'Diğer'),
        data: categoryDistribution.map(item => item._count.id)
      },
      revenueData: groupRevenueByDay(),
      topUsers: topUsers.map(user => ({
        name: user.name || 'İsimsiz',
        email: user.email,
        listingCount: user._count.listings,
        offerCount: user._count.offers
      })),
      topListings: topListings.map(listing => ({
        title: listing.title,
        viewCount: listing._count.views,
        offerCount: listing._count.offers,
        price: listing.price
      }))
    };

    return NextResponse.json({
      success: true,
      reports
    });

  } catch (error) {
    console.error('Raporlar API hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}