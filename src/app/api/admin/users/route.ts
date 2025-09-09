import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Kullanıcı listesi için query parametreleri
const usersQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  search: z.string().optional(),
  isAdmin: z.string().optional(),
  blocked: z.string().optional(),
  sortBy: z.enum(['createdAt', 'name', 'email', 'lastLoginAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
})

// GET - Kullanıcı listesi
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
    const query = usersQuerySchema.parse(Object.fromEntries(searchParams))
    
    const page = parseInt(query.page)
    const limit = parseInt(query.limit)
    const skip = (page - 1) * limit

    // Filtreleme koşulları
    const where: any = {}
    
    if (query.search) {
      where.OR = [
        {
          name: {
            contains: query.search,
            mode: 'insensitive'
          }
        },
        {
          email: {
            contains: query.search,
            mode: 'insensitive'
          }
        }
      ]
    }
    
    if (query.isAdmin) {
      where.isAdmin = query.isAdmin === 'true'
    }
    
    if (query.blocked) {
      where.isBlocked = query.blocked === 'true'
    }

    // Sıralama
    const orderBy: Record<string, 'asc' | 'desc'> = {}
    orderBy[query.sortBy] = query.sortOrder

    // Paralel olarak kullanıcıları ve toplam sayıyı getir
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          isAdmin: true,
          // isBlocked: true,
          // blockedAt: true,
          // blockReason: true,
          createdAt: true,
          // lastLoginAt: true,
          _count: {
            select: {
              listings: true,
              offers: true,
              messages: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })

  } catch (error) {
    console.error('Kullanıcılar alınırken hata:', error)
    return NextResponse.json(
      { error: 'Kullanıcılar alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// POST - Kullanıcı oluşturma (Admin tarafından)
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
    const { name, email, isAdmin = false } = body

    // E-posta kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kullanılıyor' },
        { status: 400 }
      )
    }

    // Yeni kullanıcı oluştur
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        isAdmin,
        // emailVerified: new Date(), // Admin tarafından oluşturulan kullanıcılar doğrulanmış sayılır
        // createdBy: session.user.id
      },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: newUser
    })

  } catch (error) {
    console.error('Kullanıcı oluşturulurken hata:', error)
    return NextResponse.json(
      { error: 'Kullanıcı oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// PATCH - Kullanıcı güncelleme
export async function PATCH(request: NextRequest) {
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
    const { userId, updates } = body

    // Güncelleme verilerini filtrele (sadece izin verilen alanlar)
    const allowedUpdates = {
      name: updates.name,
      email: updates.email,
      isAdmin: updates.isAdmin,
      isBlocked: updates.isBlocked,
      blockReason: updates.blockReason
    }

    // Undefined değerleri temizle
    Object.keys(allowedUpdates).forEach(key => {
      if (allowedUpdates[key as keyof typeof allowedUpdates] === undefined) {
        delete allowedUpdates[key as keyof typeof allowedUpdates]
      }
    })

    // E-posta değişikliği varsa kontrol et
    if (updates.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: updates.email,
          NOT: {
            id: userId
          }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Bu e-posta adresi zaten kullanılıyor' },
          { status: 400 }
        )
      }
    }

    // Kullanıcıyı güncelle
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...allowedUpdates,
        ...(updates.isBlocked ? { blockedAt: new Date() } : { blockedAt: null })
      },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        // isBlocked: true,
        // blockedAt: true,
          // blockReason: true,
        createdAt: true,
        // lastLoginAt: true,
        _count: {
          select: {
            listings: true,
            offers: true,
            messages: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Kullanıcı başarıyla güncellendi',
      user: updatedUser
    })

  } catch (error) {
    console.error('Kullanıcı güncellenirken hata:', error)
    return NextResponse.json(
      { error: 'Kullanıcı güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// DELETE - Kullanıcı silme (soft delete)
export async function DELETE(request: NextRequest) {
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
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Kullanıcı ID gerekli' },
        { status: 400 }
      )
    }

    // Kendi hesabını silmeye çalışıyor mu?
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Kendi hesabınızı silemezsiniz' },
        { status: 400 }
      )
    }

    // Kullanıcıyı soft delete yap
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        email: `deleted_${Date.now()}_${userId}@deleted.com` // E-posta çakışmasını önle
      }
    })

    // Kullanıcının aktif ilanlarını pasif yap
    await prisma.listing.updateMany({
      where: {
        userId,
        status: 'ACTIVE'
      },
      data: {
        status: 'CANCELLED'
      }
    })

    return NextResponse.json({
      message: 'Kullanıcı başarıyla silindi'
    })

  } catch (error) {
    console.error('Kullanıcı silinirken hata:', error)
    return NextResponse.json(
      { error: 'Kullanıcı silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}