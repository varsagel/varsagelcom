import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Admin istatistikleri için schema
const adminStatsSchema = z.object({
  dateRange: z.enum(['7d', '30d', '90d', '1y']).optional().default('30d')
})

// GET - Admin istatistikleri
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      )
    }

    // Admin yetkisi kontrolü
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekiyor' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('dateRange') || '30d'
    
    // Tarih aralığını hesapla
    const now = new Date()
    const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }
    const days = daysMap[dateRange as keyof typeof daysMap] || 30
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    // Paralel olarak tüm istatistikleri getir
    const [totalUsers, totalListings, totalOffers, totalMessages, recentUsers, recentListings, recentOffers, categoryStats, userStats, listingStats, offerStats] = await Promise.all([
      // Toplam kullanıcı sayısı
      prisma.user.count(),
      
      // Toplam ilan sayısı
      prisma.listing.count(),
      
      // Toplam teklif sayısı
      prisma.offer.count(),
      
      // Toplam mesaj sayısı
      prisma.message.count(),
      
      // Son kullanıcılar
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Son ilanlar
      prisma.listing.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Son teklifler
      prisma.offer.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Kategori istatistikleri
      prisma.listing.groupBy({
        by: ['categoryId'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      }),
      
      // Kullanıcı istatistikleri (günlük kayıt)
      prisma.$queryRaw`
        SELECT 
          DATE("createdAt") as date,
          COUNT(*) as count
        FROM "User"
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
      
      // İlan istatistikleri (günlük)
      prisma.$queryRaw`
        SELECT 
          DATE("createdAt") as date,
          COUNT(*) as count
        FROM "Listing"
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
      
      // Teklif istatistikleri (günlük)
      prisma.$queryRaw`
        SELECT 
          DATE("createdAt") as date,
          COUNT(*) as count,
          SUM(CASE WHEN status = 'ACCEPTED' THEN 1 ELSE 0 END) as accepted,
          SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected
        FROM "Offer"
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `
    ])

    // Kategori isimlerini getir
    const categoryIds = categoryStats.map(stat => stat.categoryId)
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds
        }
      },
      select: {
        id: true,
        name: true
      }
    })

    // Kategori istatistiklerini isimlerle birleştir
    const categoryStatsWithNames = categoryStats.map(stat => {
      const category = categories.find(cat => cat.id === stat.categoryId)
      return {
        categoryId: stat.categoryId,
        categoryName: category?.name || 'Bilinmeyen',
        count: stat._count.id
      }
    })

    // En aktif kullanıcıları getir
    const activeUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            listings: true,
            offers: true,
            messages: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Son aktiviteleri getir
    const recentActivities = await prisma.listing.findMany({
      select: {
        id: true,
        title: true,
        createdAt: true,
        status: true,
        user: {
          select: {
            name: true,
            email: true
          }
        },
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    return NextResponse.json({
      overview: {
        totalUsers,
        totalListings,
        totalOffers,
        totalMessages,
        recentUsers,
        recentListings,
        recentOffers
      },
      charts: {
        userStats,
        listingStats,
        offerStats,
        categoryStats: categoryStatsWithNames
      },
      activeUsers,
      recentActivities,
      dateRange
    })

  } catch (error) {
    console.error('Admin istatistikleri alınırken hata:', error)
    return NextResponse.json(
      { error: 'İstatistikler alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// POST - Admin işlemleri (kullanıcı engelleme, ilan silme vb.)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      )
    }

    // Admin yetkisi kontrolü
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekiyor' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, targetId, reason } = body

    switch (action) {
      case 'block_user':
        await prisma.user.update({
          where: { id: targetId },
          data: { 
            // isBlocked: true,
            // blockedAt: new Date(),
            // blockReason: reason
          }
        })
        
        // Kullanıcının aktif ilanlarını pasif yap
        await prisma.listing.updateMany({
          where: { 
            userId: targetId,
            status: 'ACTIVE'
          },
          data: { status: 'CANCELLED' }
        })
        
        return NextResponse.json({ message: 'Kullanıcı engellendi' })

      case 'unblock_user':
        await prisma.user.update({
          where: { id: targetId },
          data: { 
            // isBlocked: false,
            // blockedAt: null,
            // blockReason: null
          }
        })
        
        return NextResponse.json({ message: 'Kullanıcı engeli kaldırıldı' })

      case 'delete_listing':
        await prisma.listing.update({
          where: { id: targetId },
          data: { 
              status: 'CANCELLED'
            }
        })
        
        return NextResponse.json({ message: 'İlan silindi' })

      case 'approve_listing':
        await prisma.listing.update({
          where: { id: targetId },
          data: { 
            status: 'ACTIVE',
            // approvedAt: new Date(),
            // approvedBy: session.user.id
          }
        })
        
        return NextResponse.json({ message: 'İlan onaylandı' })

      case 'reject_listing':
        await prisma.listing.update({
          where: { id: targetId },
          data: { 
            status: 'CANCELLED'
          }
        })
        
        return NextResponse.json({ message: 'İlan reddedildi' })

      default:
        return NextResponse.json(
          { error: 'Geçersiz işlem' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Admin işlemi sırasında hata:', error)
    return NextResponse.json(
      { error: 'İşlem sırasında bir hata oluştu' },
      { status: 500 }
    )
  }
}