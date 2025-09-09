import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateListingSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir').optional(),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır').optional(),
  price: z.number().positive('Fiyat pozitif bir sayı olmalıdır').optional(),
  location: z.object({
    city: z.string().min(1, 'Şehir gereklidir'),
    district: z.string().min(1, 'İlçe gereklidir')
  }).optional(),
  dynamicFields: z.record(z.string(), z.any()).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'EXPIRED']).optional()
})

// GET - Tekil ilan detayını getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            fields: true
          }
        },
        offers: {
          where: {
            status: 'PENDING'
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            offers: true,
            favorites: true
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

    return NextResponse.json(listing)
  } catch (error) {
    console.error('İlan detayı getirilirken hata:', error)
    return NextResponse.json(
      { error: 'İlan detayı getirilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// PUT - İlan güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    // İlan sahibi kontrolü
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existingListing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      )
    }

    if (existingListing.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Bu ilanı güncelleme yetkiniz yok' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateListingSchema.parse(body)

    const updateData: any = {}
    
    if (validatedData.title) updateData.title = validatedData.title
    if (validatedData.description) updateData.description = validatedData.description
    if (validatedData.price) updateData.price = validatedData.price
    if (validatedData.dynamicFields) updateData.dynamicFields = validatedData.dynamicFields
    if (validatedData.status) updateData.status = validatedData.status
    
    if (validatedData.location) {
      updateData.city = validatedData.location.city
      updateData.district = validatedData.location.district
    }

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updatedListing)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    console.error('İlan güncellenirken hata:', error)
    return NextResponse.json(
      { error: 'İlan güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// DELETE - İlan sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    // İlan sahibi kontrolü
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existingListing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      )
    }

    if (existingListing.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Bu ilanı silme yetkiniz yok' },
        { status: 403 }
      )
    }

    await prisma.listing.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'İlan başarıyla silindi' })
  } catch (error) {
    console.error('İlan silinirken hata:', error)
    return NextResponse.json(
      { error: 'İlan silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}