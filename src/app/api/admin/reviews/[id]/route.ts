import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserIdFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

const ADMIN_EMAILS = [
  'admin@varsagel.com',
  'moderator@varsagel.com'
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
            category: true,
            price: true,
            images: true
          }
        }
      }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ review });

  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const { action } = await request.json();

    if (!['approve', 'reject', 'delete'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        reviewer: true,
        user: true
      }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    let updatedReview;
    let logAction = '';
    let notificationMessage = '';

    if (action === 'delete') {
      await prisma.review.delete({
        where: { id }
      });
      logAction = 'REVIEW_DELETED';
      notificationMessage = 'Değerlendirmeniz sistem yöneticisi tarafından silindi.';
    } else if (action === 'approve') {
      // Review approved - no database changes needed
      updatedReview = review;
      logAction = 'REVIEW_APPROVED';
      notificationMessage = 'Değerlendirmeniz onaylandı ve yayınlandı.';
    } else if (action === 'reject') {
      // Review rejected - no database changes needed
      updatedReview = review;
      logAction = 'REVIEW_REJECTED';
      notificationMessage = 'Değerlendirmeniz reddedildi.';
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Skip the rest of the update logic for approve/reject
    if (action === 'approve' || action === 'reject') {
      // Create admin log
      await prisma.adminLog.create({
        data: {
          action: logAction,
          targetType: 'REVIEW',
          targetId: id,
          details: { action, reviewId: id },
          adminId: userId
        }
      });

      // Send notification
      await prisma.notification.create({
        data: {
          userId: review.reviewerId,
          type: 'review_status',
          message: notificationMessage,
          metadata: { reviewId: id, action }
        }
      });

      return NextResponse.json({
        success: true,
        review: updatedReview,
        message: `Review ${action}d successfully`
      });
    }



    // Create admin log
    await prisma.adminLog.create({
      data: {
        adminId: userId,
        action: logAction,
        targetType: 'REVIEW',
        targetId: id,
        details: {
          reviewId: id,
          reviewerId: review.reviewerId,
          userId: review.userId,
          action,
          adminName: user.name
        }
      }
    });

    // Create notification for reviewer
    if (action !== 'delete') {
      await prisma.notification.create({
        data: {
          userId: review.reviewerId,
          type: 'REVIEW_STATUS',
          title: 'Değerlendirme Durumu',
          message: notificationMessage,
          metadata: {
            reviewId: id,
            action,
            userId: review.userId
          }
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      review: updatedReview,
      message: `Review ${action}d successfully` 
    });

  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const { id } = await params;
    
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        reviewer: true,
        user: true
      }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Delete the review
    await prisma.review.delete({
      where: { id }
    });

    // Create admin log
    await prisma.adminLog.create({
      data: {
        adminId: userId,
        action: 'REVIEW_DELETED',
        targetType: 'REVIEW',
        targetId: id,
        details: {
          reviewId: id,
          reviewerId: review.reviewerId,
          userId: review.userId,
          adminName: user.name,
          deletedAt: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Review deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}