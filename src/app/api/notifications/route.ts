import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createNotificationSchema = z.object({
  userId: z.string().min(1, 'Kullanıcı ID gereklidir'),
  type: z.enum(['NEW_MESSAGE', 'NEW_OFFER', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'LISTING_EXPIRING', 'SYSTEM']),
  title: z.string().min(1, 'Başlık gereklidir'),
  message: z.string().min(1, 'Mesaj gereklidir'),
  data: z.any().optional()
})

const markReadSchema = z.object({
  notificationIds: z.array(z.string()).optional(),
  markAll: z.boolean().optional()
})

// GET - Kullanıcının bildirimlerini getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const type = searchParams.get('type')

    const where: any = {
      userId: session.user.id
    }

    if (unreadOnly) {
      where.isRead = false
    }

    if (type) {
      where.type = type
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId: session.user.id,
          isRead: false
        }
      })
    ])

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      unreadCount
    })
  } catch (error) {
    console.error('Bildirimler getirilirken hata:', error)
    return NextResponse.json(
      { error: 'Bildirimler getirilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// POST - Yeni bildirim oluştur (admin/sistem kullanımı)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    // Sadece admin kullanıcılar bildirim oluşturabilir
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createNotificationSchema.parse(body)

    // Hedef kullanıcının varlığını kontrol et
    const targetUser = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      select: { id: true, name: true, email: true }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Hedef kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    const notification = await prisma.notification.create({
      data: {
        userId: validatedData.userId,
        type: validatedData.type,
        title: validatedData.title,
        message: validatedData.message,
        data: validatedData.data
      }
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Bildirim oluşturulurken hata:', error)
    return NextResponse.json(
      { error: 'Bildirim oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// PATCH - Bildirimleri okundu olarak işaretle
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = markReadSchema.parse(body)

    let updateResult

    if (validatedData.markAll) {
      // Tüm bildirimleri okundu olarak işaretle
      updateResult = await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          isRead: false
        },
        data: {
          isRead: true
        }
      })
    } else if (validatedData.notificationIds && validatedData.notificationIds.length > 0) {
      // Belirli bildirimleri okundu olarak işaretle
      updateResult = await prisma.notification.updateMany({
        where: {
          id: { in: validatedData.notificationIds },
          userId: session.user.id,
          isRead: false
        },
        data: {
          isRead: true
        }
      })
    } else {
      return NextResponse.json(
        { error: 'Geçersiz istek' },
        { status: 400 }
      )
    }

    // Güncel okunmamış bildirim sayısını getir
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false
      }
    })

    return NextResponse.json({
      message: 'Bildirimler güncellendi',
      updatedCount: updateResult.count,
      unreadCount
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Bildirimler güncellenirken hata:', error)
    return NextResponse.json(
      { error: 'Bildirimler güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// DELETE - Bildirimleri sil
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const notificationIds = searchParams.get('ids')?.split(',')
    const deleteAll = searchParams.get('deleteAll') === 'true'
    const deleteRead = searchParams.get('deleteRead') === 'true'

    let deleteResult

    if (deleteAll) {
      // Tüm bildirimleri sil
      deleteResult = await prisma.notification.deleteMany({
        where: {
          userId: session.user.id
        }
      })
    } else if (deleteRead) {
      // Okunmuş bildirimleri sil
      deleteResult = await prisma.notification.deleteMany({
        where: {
          userId: session.user.id,
          isRead: true
        }
      })
    } else if (notificationIds && notificationIds.length > 0) {
      // Belirli bildirimleri sil
      deleteResult = await prisma.notification.deleteMany({
        where: {
          id: { in: notificationIds },
          userId: session.user.id
        }
      })
    } else {
      return NextResponse.json(
        { error: 'Geçersiz istek' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Bildirimler silindi',
      deletedCount: deleteResult.count
    })
  } catch (error) {
    console.error('Bildirimler silinirken hata:', error)
    return NextResponse.json(
      { error: 'Bildirimler silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}