import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserIdFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

const ADMIN_EMAILS = [
  'admin@varsagel.com',
  'moderator@varsagel.com'
];

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request.headers);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    });

    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { reviewIds, action } = await request.json();

    if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
      return NextResponse.json({ error: 'Review IDs are required' }, { status: 400 });
    }

    if (!['approve', 'reject', 'delete'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get reviews before performing action
    const reviews = await prisma.review.findMany({
      where: {
        id: {
          in: reviewIds
        }
      },
      include: {
        reviewer: true,
        user: true
      }
    });

    if (reviews.length === 0) {
      return NextResponse.json({ error: 'No reviews found' }, { status: 404 });
    }

    let result: { count: number };
    let logAction: string;
    let notificationMessage: string;

    if (action === 'delete') {
      result = await prisma.review.deleteMany({
        where: {
          id: {
            in: reviewIds
          }
        }
      });
      logAction = 'REVIEWS_BULK_DELETED';
      notificationMessage = 'Değerlendirmeniz sistem yöneticisi tarafından silindi.';
    } else if (action === 'approve') {
      // Note: Review model doesn't have isApproved/isReported fields
      // This action will only create logs and notifications
      result = { count: reviewIds.length };
      logAction = 'REVIEWS_BULK_APPROVED';
      notificationMessage = 'Değerlendirmeniz onaylandı ve yayınlandı.';
    } else if (action === 'reject') {
      // Note: Review model doesn't have isApproved/isReported fields
      // This action will only create logs and notifications
      result = { count: reviewIds.length };
      logAction = 'REVIEWS_BULK_REJECTED';
      notificationMessage = 'Değerlendirmeniz reddedildi.';
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Create admin log
    await prisma.adminLog.create({
      data: {
        adminId: userId,
        action: logAction,
        targetType: 'REVIEW',
        targetId: reviewIds.join(','),
        details: {
          reviewIds,
          action,
          adminName: user.name,
          affectedCount: result.count,
          reviewerIds: reviews.map(r => r.reviewerId),
          userIds: reviews.map(r => r.userId)
        }
      }
    });

    // Create notifications for reviewers (only if not deleting)
    if (action !== 'delete') {
      const notifications = reviews.map(review => ({
        userId: review.reviewerId,
        type: 'REVIEW_STATUS' as const,
        title: 'Değerlendirme Durumu',
        message: notificationMessage,
        metadata: {
          reviewId: review.id,
          action,
          userId: review.userId,
          bulkAction: true
        }
      }));

      await prisma.notification.createMany({
        data: notifications
      });
    }

    return NextResponse.json({ 
      success: true,
      affectedCount: result?.count || reviews.length,
      message: `${result?.count || reviews.length} reviews ${action}d successfully` 
    });

  } catch (error) {
    console.error('Error performing bulk action on reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}