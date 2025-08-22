import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserId } from '@/lib/auth';

const prisma = new PrismaClient();

// İlanı tekrar aktif et (kabul edilen teklifi reddet)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const userId = getUserId(request.headers);
    const listingId = id;

    // İlanın kullanıcıya ait olduğunu kontrol et
    const listing = await prisma.listing.findFirst({
      where: {
        id: listingId,
        userId: userId
      },
      include: {
        offers: {
          where: {
            status: 'accepted'
          }
        }
      }
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı veya bu işlem için yetkiniz yok' },
        { status: 404 }
      );
    }

    // Kabul edilen teklifleri reddet
    if (listing.offers.length > 0) {
      await prisma.offer.updateMany({
        where: {
          listingId: listingId,
          status: 'accepted'
        },
        data: {
          status: 'rejected'
        }
      });
    }

    // İlanı aktif duruma getir (eğer kapalı ise)
    await prisma.listing.update({
      where: {
        id: listingId
      },
      data: {
        status: 'active',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'İlan başarıyla tekrar aktif edildi'
    });

  } catch (error) {
    console.error('Error reactivating listing:', error);
    return NextResponse.json(
      { error: 'İlan tekrar aktif edilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}