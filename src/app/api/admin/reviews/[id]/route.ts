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
  { params }: { params: { id: string } }
) {
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
      where: { id: params.id },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            createdAt: true
          }
        },
        reviewee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
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
  { params }: { params: { id: string } }
) {
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
      where: { id: params.id },
      include: {
        reviewer: true,
        reviewee: true
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
        where: { id: params.id }
      });
      logAction = 'REVIEW_DELETED';
      notificationMessage = 'Değerlendirmeniz sistem yöneticisi tarafından silindi.';
    } else if (action === 'approve') {
      updatedReview = await prisma.review.update({
        where: { id: params.id },
        data: {
          isApproved: true,
          isReported: false
        }
      });
      logAction = 'REVIEW_APPROVED';
      notificationMessage = 'Değerlendirmeniz onaylandı ve yayınlandı.';
    } else if (action === 'reject') {
      updatedReview = await prisma.review.update({
        where: { id: params.id },
        data: {
          isApproved: false,
          isReported: false
        }
      });
      logAction = 'REVIEW_REJECTED';
      notificationMessage = 'Değerlendirmeniz reddedildi.';
    }

    // Create admin log
    await prisma.adminLog.create({
      data: {
        adminId: userId,
        action: logAction,
        targetType: 'REVIEW',
        targetId: params.id,
        details: {
          reviewId: params.id,
          reviewerId: review.reviewerId,
          revieweeId: review.revieweeId,
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
          data: {
            reviewId: params.id,
            action,
            revieweeId: review.revieweeId
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
  { params }: { params: { id: string } }
) {
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

    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: {
        reviewer: true,
        reviewee: true
      }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Delete the review
    await prisma.review.delete({
      where: { id: params.id }
    });

    // Create admin log
    await prisma.adminLog.create({
      data: {
        adminId: userId,
        action: 'REVIEW_DELETED',
        targetType: 'REVIEW',
        targetId: params.id,
        details: {
          reviewId: params.id,
          reviewerId: review.reviewerId,
          revieweeId: review.revieweeId,
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