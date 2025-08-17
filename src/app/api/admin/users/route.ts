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
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Arama koşulları
    const whereCondition = search ? {
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
    } : {};

    // Sıralama koşulları
    const orderBy: any = {};
    if (sortBy === 'listings') {
      orderBy.listings = { _count: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Paralel olarak kullanıcıları ve toplam sayıyı getir
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereCondition,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profileImage: true,
          isBanned: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              listings: true,
              offers: true,
              reviews: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.user.count({
        where: whereCondition
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      users,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { error: 'Kullanıcılar alınırken hata oluştu' },
      { status: 500 }
    );
  }
}