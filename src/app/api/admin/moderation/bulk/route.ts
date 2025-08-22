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

    const { action, reportIds, moderatorNotes } = await request.json();

    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return NextResponse.json(
        { error: 'Report IDs are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject', 'flag', 'resolve', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Get all reports to process
    const reports = await prisma.report.findMany({
      where: {
        id: { in: reportIds }
      }
    });

    if (reports.length === 0) {
      return NextResponse.json(
        { error: 'No reports found' },
        { status: 404 }
      );
    }

    let results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const report of reports) {
      try {
        if (action === 'delete') {
          await prisma.report.delete({
            where: { id: report.id }
          });
        } else {
          let updateData: any = {
            moderatorNotes,
            resolvedBy: { connect: { id: userId } },
            resolvedAt: new Date()
          };

          // Handle different actions
          if (action === 'approve') {
            updateData.status = 'APPROVED';
            
            // Take action on the reported content based on type
            try {
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
            } catch (targetError) {
              console.warn(`Failed to update target ${report.targetType} ${report.targetId}:`, targetError);
            }
          } else if (action === 'reject') {
            updateData.status = 'REJECTED';
          } else if (action === 'flag') {
            updateData.status = 'FLAGGED';
            updateData.priority = 'URGENT';
          } else if (action === 'resolve') {
            updateData.status = 'RESOLVED';
          }

          await prisma.report.update({
            where: { id: report.id },
            data: updateData
          });

          // Create notification for the user who reported
          if (action === 'approve' || action === 'resolve') {
            try {
              await prisma.notification.create({
                data: {
                  userId: report.reportedById,
                  type: 'MODERATION_UPDATE',
                  title: 'Rapor Güncellendi',
                  message: `Raporunuz ${action === 'approve' ? 'onaylandı' : 'çözüldü'} ve gerekli işlemler yapıldı.`,
                  metadata: {
                    reportId: report.id,
                    action
                  }
                }
              });
            } catch (notificationError) {
              console.warn(`Failed to create notification for report ${report.id}:`, notificationError);
            }
          }
        }

        results.push({
          reportId: report.id,
          success: true
        });
        successCount++;

      } catch (error) {
        console.error(`Error processing report ${report.id}:`, error);
        results.push({
          reportId: report.id,
          success: false,
          error: 'Processing failed'
        });
        errorCount++;
      }
    }

    // Create admin log for bulk action
    await prisma.adminLog.create({
      data: {
        adminId: userId,
        action: `MODERATION_BULK_${action.toUpperCase()}`,
        targetType: 'REPORT',
        targetId: reportIds.join(','),
        details: {
          action,
          reportIds,
          successCount,
          errorCount,
          moderatorNotes
        }
      }
    });

    return NextResponse.json({
      message: `Bulk ${action} completed`,
      results,
      summary: {
        total: reports.length,
        success: successCount,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error('Error in bulk moderation action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}