import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateOfferSchema = z.object({
  price: z.number().positive('Fiyat pozitif bir sayı olmalıdır').optional(),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır').optional(),
  dynamicFields: z.record(z.string(), z.any()).optional(),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED']).optional()
})

// GET - Tekil teklif detayını getir
export async function GET(
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

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        listing: {
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
                slug: true,
                fields: true
              }
            }
          }
        }
      }
    })

    if (!offer) {
      return NextResponse.json(
        { error: 'Teklif bulunamadı' },
        { status: 404 }
      )
    }

    // Sadece teklif sahibi veya ilan sahibi görebilir
    if (offer.userId !== session.user.id && offer.listing.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Bu teklifi görme yetkiniz yok' },
        { status: 403 }
      )
    }

    return NextResponse.json(offer)
  } catch (error) {
    console.error('Teklif detayı getirilirken hata:', error)
    return NextResponse.json(
      { error: 'Teklif detayı getirilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// PUT - Teklif güncelle
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

    const body = await request.json()
    const validatedData = updateOfferSchema.parse(body)

    // Teklif kontrolü
    const existingOffer = await prisma.offer.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
            userId: true,
            status: true,
            expiresAt: true
          }
        }
      }
    })

    if (!existingOffer) {
      return NextResponse.json(
        { error: 'Teklif bulunamadı' },
        { status: 404 }
      )
    }

    // Yetki kontrolü
    const isOfferOwner = existingOffer.userId === session.user.id
    const isListingOwner = existingOffer.listing.userId === session.user.id

    if (!isOfferOwner && !isListingOwner) {
      return NextResponse.json(
        { error: 'Bu teklifi güncelleme yetkiniz yok' },
        { status: 403 }
      )
    }

    // Durum güncelleme yetki kontrolü
    if (validatedData.status) {
      if (validatedData.status === 'ACCEPTED' || validatedData.status === 'REJECTED') {
        // Sadece ilan sahibi kabul/red edebilir
        if (!isListingOwner) {
          return NextResponse.json(
            { error: 'Teklifi kabul/red etme yetkiniz yok' },
            { status: 403 }
          )
        }
      } else if (validatedData.status === 'CANCELLED') {
        // Sadece teklif sahibi iptal edebilir
        if (!isOfferOwner) {
          return NextResponse.json(
            { error: 'Teklifi iptal etme yetkiniz yok' },
            { status: 403 }
          )
        }
      }
    }

    // Teklif sahibi sadece PENDING durumundaki teklifini güncelleyebilir
    if (isOfferOwner && existingOffer.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Sadece bekleyen teklifler güncellenebilir' },
        { status: 400 }
      )
    }

    // İlan aktif mi kontrolü
    if (existingOffer.listing.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Bu ilan artık aktif değil' },
        { status: 400 }
      )
    }

    // İlan süresi dolmuş mu kontrolü
    if (new Date() > new Date(existingOffer.listing.expiresAt)) {
      return NextResponse.json(
        { error: 'Bu ilanın süresi dolmuş' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    
    if (validatedData.price !== undefined) updateData.price = validatedData.price
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.dynamicFields !== undefined) updateData.dynamicFields = validatedData.dynamicFields
    if (validatedData.status !== undefined) updateData.status = validatedData.status

    const updatedOffer = await prisma.offer.update({
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

    return NextResponse.json(updatedOffer)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Teklif güncellenirken hata:', error)
    return NextResponse.json(
      { error: 'Teklif güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// DELETE - Teklif sil
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

    // Teklif sahibi kontrolü
    const existingOffer = await prisma.offer.findUnique({
      where: { id },
      select: { userId: true, status: true }
    })

    if (!existingOffer) {
      return NextResponse.json(
        { error: 'Teklif bulunamadı' },
        { status: 404 }
      )
    }

    if (existingOffer.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Bu teklifi silme yetkiniz yok' },
        { status: 403 }
      )
    }

    // Kabul edilmiş teklifler silinemez
    if (existingOffer.status === 'ACCEPTED') {
      return NextResponse.json(
        { error: 'Kabul edilmiş teklifler silinemez' },
        { status: 400 }
      )
    }

    await prisma.offer.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Teklif başarıyla silindi' })
  } catch (error) {
    console.error('Teklif silinirken hata:', error)
    return NextResponse.json(
      { error: 'Teklif silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}