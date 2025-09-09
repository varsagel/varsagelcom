import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createOfferSchema = z.object({
  listingId: z.string().min(1, 'İlan ID gereklidir'),
  price: z.number().positive('Fiyat pozitif bir sayı olmalıdır'),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır'),
  dynamicFields: z.record(z.string(), z.any()).optional()
})

// GET - Kullanıcının tekliflerini getir
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
    const listingId = searchParams.get('listingId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {
      userId: session.user.id
    }

    if (listingId) {
      where.listingId = listingId
    }

    if (status) {
      where.status = status
    }

    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              city: true,
              district: true,
              status: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.offer.count({ where })
    ])

    return NextResponse.json({
      offers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Teklifler getirilirken hata:', error)
    return NextResponse.json(
      { error: 'Teklifler getirilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// POST - Yeni teklif oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createOfferSchema.parse(body)

    // İlan kontrolü
    const listing = await prisma.listing.findUnique({
      where: { id: validatedData.listingId },
      include: {
        category: {
          include: {
            fields: true
          }
        }
      }
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      )
    }

    // İlan aktif mi kontrolü
    if (listing.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Bu ilan artık aktif değil' },
        { status: 400 }
      )
    }

    // İlan süresi dolmuş mu kontrolü
    if (new Date() > new Date(listing.expiresAt)) {
      return NextResponse.json(
        { error: 'Bu ilanın süresi dolmuş' },
        { status: 400 }
      )
    }

    // Kendi ilanına teklif verme kontrolü
    if (listing.userId === session.user.id) {
      return NextResponse.json(
        { error: 'Kendi ilanınıza teklif veremezsiniz' },
        { status: 400 }
      )
    }

    // Daha önce teklif vermiş mi kontrolü
    const existingOffer = await prisma.offer.findFirst({
      where: {
        listingId: validatedData.listingId,
        userId: session.user.id,
        status: 'PENDING'
      }
    })

    if (existingOffer) {
      return NextResponse.json(
        { error: 'Bu ilana zaten bekleyen bir teklifiniz var' },
        { status: 400 }
      )
    }

    // Son reddedilen tekliften sonra 2 saat geçmiş mi kontrolü
    const lastRejectedOffer = await prisma.offer.findFirst({
      where: {
        listingId: validatedData.listingId,
        userId: session.user.id,
        status: 'REJECTED'
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    if (lastRejectedOffer) {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
      if (new Date(lastRejectedOffer.updatedAt) > twoHoursAgo) {
        return NextResponse.json(
          { error: 'Reddedilen tekliften sonra 2 saat beklemeniz gerekiyor' },
          { status: 400 }
        )
      }
    }

    const offer = await prisma.offer.create({
      data: {
        price: validatedData.price,
        message: validatedData.description,
        userId: session.user.id,
        listingId: validatedData.listingId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(offer, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Teklif oluşturulurken hata:', error)
    return NextResponse.json(
      { error: 'Teklif oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}