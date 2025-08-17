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
    const type = searchParams.get('type') || 'all';
    const status = searchParams.get('status') || 'all';
    const priority = searchParams.get('priority') || 'all';
    const sortBy = searchParams.get('sortBy') || 'reportedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where condition for reports
    const whereCondition: any = {};

    if (search) {
      whereCondition.OR = [
        {
          reportReason: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          reportedBy: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    if (type !== 'all') {
      whereCondition.targetType = type;
    }

    if (status !== 'all') {
      whereCondition.status = status.toUpperCase();
    }

    if (priority !== 'all') {
      whereCondition.priority = priority.toUpperCase();
    }

    // Build order by
    const orderBy: any = {};
    if (sortBy === 'reportedAt') {
      orderBy.createdAt = sortOrder;
    } else if (sortBy === 'priority') {
      orderBy.priority = sortOrder;
    } else if (sortBy === 'type') {
      orderBy.targetType = sortOrder;
    }

    // Get moderation items (reports) with pagination
    const [reports, totalCount] = await Promise.all([
      prisma.report.findMany({
        where: whereCondition,
        include: {
          reportedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          resolvedBy: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.report.count({ where: whereCondition })
    ]);

    // Transform reports to moderation items format
    const items = await Promise.all(reports.map(async (report) => {
      let target: any = { id: report.targetId };
      
      // Get target details based on type
      if (report.targetType === 'USER') {
        const user = await prisma.user.findUnique({
          where: { id: report.targetId },
          select: { id: true, name: true, email: true }
        });
        target = user || { id: report.targetId, name: 'Deleted User', email: '' };
      } else if (report.targetType === 'LISTING') {
        const listing = await prisma.listing.findUnique({
          where: { id: report.targetId },
          select: { id: true, title: true, description: true }
        });
        target = listing ? {
          id: listing.id,
          title: listing.title,
          content: listing.description
        } : { id: report.targetId, title: 'Deleted Listing', content: '' };
      } else if (report.targetType === 'REVIEW') {
        const review = await prisma.review.findUnique({
          where: { id: report.targetId },
          select: { id: true, comment: true, rating: true }
        });
        target = review ? {
          id: review.id,
          title: `Review (${review.rating} stars)`,
          content: review.comment
        } : { id: report.targetId, title: 'Deleted Review', content: '' };
      } else if (report.targetType === 'MESSAGE') {
        const message = await prisma.message.findUnique({
          where: { id: report.targetId },
          select: { id: true, content: true }
        });
        target = message ? {
          id: message.id,
          title: 'Message',
          content: message.content
        } : { id: report.targetId, title: 'Deleted Message', content: '' };
      }

      return {
        id: report.id,
        type: report.targetType,
        status: report.status,
        priority: report.priority,
        reportReason: report.reason,
        reportedAt: report.createdAt.toISOString(),
        reportedBy: report.reportedBy,
        target,
        moderatorNotes: report.moderatorNotes,
        resolvedAt: report.resolvedAt?.toISOString(),
        resolvedBy: report.resolvedBy
      };
    }));

    // Get stats
    const [totalReports, pendingReports, approvedReports, rejectedReports, flaggedReports, urgentReports] = await Promise.all([
      prisma.report.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.report.count({ where: { status: 'APPROVED' } }),
      prisma.report.count({ where: { status: 'REJECTED' } }),
      prisma.report.count({ where: { status: 'FLAGGED' } }),
      prisma.report.count({ where: { priority: 'URGENT' } })
    ]);

    const stats = {
      total: totalReports,
      pending: pendingReports,
      approved: approvedReports,
      rejected: rejectedReports,
      flagged: flaggedReports,
      urgent: urgentReports
    };

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      items,
      stats,
      totalPages,
      currentPage: page,
      totalCount
    });

  } catch (error) {
    console.error('Error fetching moderation items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}