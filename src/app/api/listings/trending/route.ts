import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// En çok görüntülenen ve en çok teklif alan ilanları getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'most-viewed' veya 'most-offers'
    const limit = parseInt(searchParams.get('limit') || '5');
    const excludeIds = searchParams.get('exclude')?.split(',').filter(Boolean) || [];

    if (type === 'most-viewed') {
      // En çok görüntülenen ilanlar
      const mostViewedListings = await prisma.listing.findMany({
        where: {
          status: 'active',
          offers: {
            none: {
              status: 'accepted'
            }
          },
          id: {
            notIn: excludeIds
          }
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
              views: true,
              offers: true,
              favorites: true,
            },
          },
        },
        orderBy: {
          views: {
            _count: 'desc'
          }
        },
        take: limit,
      });

      const formattedListings = mostViewedListings.map(listing => ({
        id: listing.id,
        title: listing.title,
        category: listing.category,
        location: listing.location,
        budgetMin: listing.budgetMin,
        budgetMax: listing.budgetMax,
        images: listing.images ? JSON.parse(listing.images) : [],
        viewCount: listing._count.views,
        offerCount: listing._count.offers,
        favoriteCount: listing._count.favorites,
        user: listing.user,
        createdAt: listing.createdAt,
        displayNumber: listing.displayNumber
      }));

      return NextResponse.json({
        success: true,
        listings: formattedListings,
        type: 'most-viewed'
      });
    }
    
    if (type === 'most-offers') {
      // En çok teklif alan ilanlar
      const mostOfferedListings = await prisma.listing.findMany({
        where: {
          status: 'active',
          offers: {
            none: {
              status: 'accepted'
            }
          },
          id: {
            notIn: excludeIds
          }
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
              views: true,
              offers: true,
              favorites: true,
            },
          },
        },
        orderBy: {
          offers: {
            _count: 'desc'
          }
        },
        take: limit,
      });

      const formattedListings = mostOfferedListings.map(listing => ({
        id: listing.id,
        title: listing.title,
        category: listing.category,
        location: listing.location,
        budgetMin: listing.budgetMin,
        budgetMax: listing.budgetMax,
        images: listing.images ? JSON.parse(listing.images) : [],
        viewCount: listing._count.views,
        offerCount: listing._count.offers,
        favoriteCount: listing._count.favorites,
        user: listing.user,
        createdAt: listing.createdAt,
        displayNumber: listing.displayNumber
      }));

      return NextResponse.json({
        success: true,
        listings: formattedListings,
        type: 'most-offers'
      });
    }

    return NextResponse.json(
      { error: 'Geçersiz tip parametresi. "most-viewed" veya "most-offers" kullanın.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error fetching trending listings:', error);
    return NextResponse.json(
      { error: 'Trend ilanlar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}