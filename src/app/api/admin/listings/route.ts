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
          title: {
            contains: search,
            mode: 'insensitive' as const
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive' as const
          }
        },
        {
          category: {
            contains: search,
            mode: 'insensitive' as const
          }
        }
      ];
    }

    if (status !== 'all') {
      whereCondition.status = status;
    }

    // Sıralama koşulları
    const orderBy: any = {};
    if (sortBy === 'views') {
      orderBy.views = { _count: sortOrder };
    } else if (sortBy === 'offers') {
      orderBy.offers = { _count: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Paralel olarak ilanları ve toplam sayıyı getir
    const [listings, totalCount] = await Promise.all([
      prisma.listing.findMany({
        where: whereCondition,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          subcategory: true,
          location: true,
          district: true,
          budgetMin: true,
          budgetMax: true,
          price: true,
          isFeatured: true,
          images: true,
          videoUrl: true,
          expiresAt: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          likeCount: true,
          favoriteCount: true,
          viewCount: true,
          user: {
            select: {
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              offers: true,
              favorites: true,
              views: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.listing.count({
        where: whereCondition
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      listings,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Admin listings error:', error);
    return NextResponse.json(
      { error: 'İlanlar alınırken hata oluştu' },
      { status: 500 }
    );
  }
}