import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // İlanın var olduğunu kontrol et - önce id ile ara, bulamazsa listingNumber ile ara
    let listing = await prisma.listing.findUnique({
      where: { id: id },
      select: { id: true, views: true }
    });

    if (!listing) {
      listing = await prisma.listing.findUnique({
        where: { listingNumber: id },
        select: { id: true, views: true }
      });
    }

    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    // Görüntülenme sayısını artır
    await prisma.listing.update({
      where: { id: listing.id },
      data: {
        views: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Görüntülenme sayısı artırma hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}