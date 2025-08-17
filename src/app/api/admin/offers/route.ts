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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Arama koşulları
    let whereCondition: any = {};
    
    if (search) {
      whereCondition.OR = [
        {
          message: {
            contains: search,
            mode: 'insensitive' as const
          }
        },
        {
          user: {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive' as const
                }
              },
              {
                email: {
                  contains: search,
                  mode: 'insensitive' as const
                }
              }
            ]
          }
        },
        {
          listing: {
            title: {
              contains: search,
              mode: 'insensitive' as const
            }
          }
        }
      ];
    }
    
    if (status !== 'all') {
      whereCondition.status = status;
    }

    // Sıralama koşulları
    const orderBy: any = {};
    if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'status') {
      orderBy.status = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // Toplam sayı
    const totalCount = await prisma.offer.count({
      where: whereCondition
    });

    // Teklifleri getir
    const offers = await prisma.offer.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
            category: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy,
      skip,
      take: limit
    });

    // İstatistikleri getir
    const stats = await prisma.offer.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    const statsFormatted = {
      total: totalCount,
      pending: stats.find(s => s.status === 'pending')?._count.id || 0,
      accepted: stats.find(s => s.status === 'accepted')?._count.id || 0,
      rejected: stats.find(s => s.status === 'rejected')?._count.id || 0,
      completed: stats.find(s => s.status === 'completed')?._count.id || 0,
      cancelled: stats.find(s => s.status === 'cancelled')?._count.id || 0
    };

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      offers,
      stats: statsFormatted,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Admin offers fetch error:', error);
    return NextResponse.json(
      { error: 'Teklifler getirilemedi' },
      { status: 500 }
    );
  }
}