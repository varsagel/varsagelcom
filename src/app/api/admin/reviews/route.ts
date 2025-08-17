import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserIdFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

const ADMIN_EMAILS = [
  'admin@varsagel.com',
  'moderator@varsagel.com'
];

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request.headers);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const rating = searchParams.get('rating') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where condition
    const whereCondition: any = {};

    if (search) {
      whereCondition.OR = [
        {
          comment: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          reviewer: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    // Status filtering removed as isApproved and isReported fields don't exist in Review model

    if (rating !== 'all') {
      whereCondition.rating = parseInt(rating);
    }

    // Build order by
    const orderBy: any = {};
    if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else if (sortBy === 'rating') {
      orderBy.rating = sortOrder;
    }

    // Get reviews with pagination
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: whereCondition,
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          listing: {
            select: {
              id: true,
              title: true,
              category: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.review.count({ where: whereCondition })
    ]);

    // Get stats
    const [totalReviews, avgRating] = await Promise.all([
      prisma.review.count(),
      prisma.review.aggregate({
        _avg: {
          rating: true
        }
      })
    ]);

    const stats = {
      total: totalReviews,
      averageRating: avgRating._avg.rating || 0
    };

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      reviews,
      stats,
      totalPages,
      currentPage: page,
      totalCount
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}