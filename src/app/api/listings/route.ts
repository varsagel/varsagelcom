import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createListingSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir'),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır'),
  categoryId: z.string().min(1, 'Kategori seçimi gereklidir'),
  minPrice: z.number().positive('Minimum fiyat pozitif bir sayı olmalıdır').optional(),
  maxPrice: z.number().positive('Maksimum fiyat pozitif bir sayı olmalıdır').optional(),
  location: z.object({
    city: z.string().min(1, 'Şehir gereklidir'),
    district: z.string().min(1, 'İlçe gereklidir')
  }),
  dynamicFields: z.record(z.string(), z.any()).optional(),
  expiresAt: z.string().optional()
})

// GET - Aktif ilanları getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const city = searchParams.get('city')
    const district = searchParams.get('district')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')

    const where: any = {
      status: 'ACTIVE',
      expiresAt: {
        gt: new Date()
      }
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (city) {
      where.city = city
    }

    if (district) {
      where.district = district
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
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
          },
          _count: {
            select: {
              offers: {
                where: {
                  status: 'PENDING'
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
      prisma.listing.count({ where })
    ])

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('İlanları getirirken hata:', error)
    return NextResponse.json(
      { error: 'İlanlar getirilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// POST - Yeni ilan oluştur
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
    const validatedData = createListingSchema.parse(body)

    // Kategori kontrolü
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
      include: { fields: true }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Geçersiz kategori' },
        { status: 400 }
      )
    }

    // Varsayılan süre: 1 ay
    const expiresAt = validatedData.expiresAt 
      ? new Date(validatedData.expiresAt)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 gün

    const listing = await prisma.listing.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        minPrice: validatedData.minPrice,
        maxPrice: validatedData.maxPrice,
        city: validatedData.location.city,
        district: validatedData.location.district,
        // dynamicFields: validatedData.dynamicFields || {},
        expiresAt,
        userId: session.user.id,
        categoryId: validatedData.categoryId
      },
      include: {
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
    })

    return NextResponse.json(listing, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    console.error('İlan oluştururken hata:', error)
    return NextResponse.json(
      { error: 'İlan oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}