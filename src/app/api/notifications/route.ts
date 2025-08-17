import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserIdFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

// Kullanıcının bildirimlerini getir
export async function GET(request: NextRequest) {
  try {
    // Kullanıcı ID'sini al
    const userId = await getUserIdFromToken(request.headers);
    
    // Sayfalama parametreleri
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const since = searchParams.get('since');
    
    // Tarih filtresi için where koşulu
    const whereCondition: any = { userId };
    if (since) {
      whereCondition.createdAt = {
        gte: new Date(since)
      };
    }
    
    // Mesaj bildirimleri hariç diğer bildirimleri getir
    const notificationWhereCondition = {
      ...whereCondition,
      type: {
        not: 'new_message'
      }
    };
    
    // Bildirimleri getir
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: notificationWhereCondition,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: notificationWhereCondition }),
    ]);
    
    // Toplam sayfa sayısı
    const totalPages = Math.ceil(total / limit);
    
    // Okunmamış bildirim sayısı (mesaj bildirimleri hariç)
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
        type: {
          not: 'new_message'
        }
      },
    });
    
    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching notifications' },
      { status: 500 }
    );
  }
}

// Bildirimleri okundu olarak işaretle
export async function PUT(request: NextRequest) {
  try {
    // Kullanıcı ID'sini al
    const userId = await getUserIdFromToken(request.headers);
    
    // Request body'den verileri al
    const body = await request.json();
    const { notificationIds } = body;
    
    // Tüm bildirimleri okundu olarak işaretle
    if (!notificationIds || notificationIds.length === 0) {
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });
      
      return NextResponse.json({
        message: 'All notifications marked as read',
      });
    }
    
    // Belirli bildirimleri okundu olarak işaretle
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId,
      },
      data: {
        isRead: true,
      },
    });
    
    return NextResponse.json({
      message: 'Notifications marked as read',
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'An error occurred while marking notifications as read' },
      { status: 500 }
    );
  }
}