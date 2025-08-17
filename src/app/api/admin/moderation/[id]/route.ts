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

    const { id } = await params;
    const reportId = id;

    const report = await prisma.report.findUnique({
      where: { id: reportId },
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
      }
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Get target details based on type
    let target: any = { id: report.targetId };
    
    if (report.targetType === 'USER') {
      const targetUser = await prisma.user.findUnique({
        where: { id: report.targetId },
        select: { 
          id: true, 
          name: true, 
          email: true, 
          createdAt: true,
          _count: {
            select: {
              listings: true,
              offers: true,
              reviews: true
            }
          }
        }
      });
      target = targetUser || { id: report.targetId, name: 'Deleted User', email: '' };
    } else if (report.targetType === 'LISTING') {
      const listing = await prisma.listing.findUnique({
        where: { id: report.targetId },
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      });
      target = listing ? {
        id: listing.id,
        title: listing.title,
        content: listing.description,
        price: listing.price,
        category: listing.category,
        user: listing.user,
        createdAt: listing.createdAt
      } : { id: report.targetId, title: 'Deleted Listing', content: '' };
    } else if (report.targetType === 'REVIEW') {
      const review = await prisma.review.findUnique({
        where: { id: report.targetId },
        include: {
          reviewer: {
            select: { id: true, name: true }
          },
          listing: {
            select: { id: true, title: true }
          }
        }
      });
      target = review ? {
        id: review.id,
        title: `Review (${review.rating} stars)`,
        content: review.comment,
        rating: review.rating,
        reviewer: review.reviewer,
        listing: review.listing,
        createdAt: review.createdAt
      } : { id: report.targetId, title: 'Deleted Review', content: '' };
    } else if (report.targetType === 'MESSAGE') {
      const message = await prisma.message.findUnique({
        where: { id: report.targetId },
        include: {
          sender: {
            select: { id: true, name: true }
          },
          conversation: {
            select: { id: true }
          }
        }
      });
      target = message ? {
        id: message.id,
        title: 'Message',
        content: message.content,
        sender: message.sender,
        conversationId: message.conversation.id,
        createdAt: message.createdAt
      } : { id: report.targetId, title: 'Deleted Message', content: '' };
    }

    const moderationItem = {
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

    return NextResponse.json(moderationItem);

  } catch (error) {
    console.error('Error fetching moderation item:', error);
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
    const reportId = id;
    const { action, moderatorNotes } = await request.json();

    const report = await prisma.report.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    let updateData: any = {
      moderatorNotes,
      resolvedBy: { connect: { id: userId } },
      resolvedAt: new Date()
    };

    // Handle different actions
    if (action === 'approve') {
      updateData.status = 'APPROVED';
      
      // Take action on the reported content based on type
      if (report.targetType === 'USER') {
        await prisma.user.update({
          where: { id: report.targetId },
          data: { isBanned: true }
        });
      } else if (report.targetType === 'LISTING') {
        await prisma.listing.update({
          where: { id: report.targetId },
          data: { status: 'inactive' }
        });
      }
    } else if (action === 'reject') {
      updateData.status = 'REJECTED';
    } else if (action === 'flag') {
      updateData.status = 'FLAGGED';
      updateData.priority = 'URGENT';
    } else if (action === 'resolve') {
      updateData.status = 'RESOLVED';
    }

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: updateData,
      include: {
        reportedBy: {
          select: { id: true, name: true }
        },
        resolvedBy: {
          select: { id: true, name: true }
        }
      }
    });

    // Create admin log
    await prisma.adminLog.create({
      data: {
        adminId: userId,
        action: `MODERATION_${action.toUpperCase()}`,
        targetType: 'REPORT',
        targetId: reportId,
        details: {
          reportType: report.targetType,
          targetId: report.targetId,
          action,
          moderatorNotes
        }
      }
    });

    // Create notification for the user who reported
    if (action === 'approve' || action === 'resolve') {
      await prisma.notification.create({
        data: {
          userId: report.reportedById,
          type: 'MODERATION_UPDATE',
          title: 'Rapor Güncellendi',
          message: `Raporunuz ${action === 'approve' ? 'onaylandı' : 'çözüldü'} ve gerekli işlemler yapıldı.`,
          data: {
            reportId: reportId,
            action
          }
        }
      });
    }

    return NextResponse.json({
      message: 'Moderation action completed successfully',
      report: updatedReport
    });

  } catch (error) {
    console.error('Error updating moderation item:', error);
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

    const { id } = await params;
    const reportId = id;

    const report = await prisma.report.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    await prisma.report.delete({
      where: { id: reportId }
    });

    // Create admin log
    await prisma.adminLog.create({
      data: {
        adminId: userId,
        action: 'MODERATION_DELETE',
        targetType: 'REPORT',
        targetId: reportId,
        details: {
          reportType: report.targetType,
          targetId: report.targetId
        }
      }
    });

    return NextResponse.json({
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting moderation item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}