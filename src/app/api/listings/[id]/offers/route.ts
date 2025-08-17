import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Token'ı al ve doğrula
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Yetkilendirme tokeni gerekli' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let userId: string;
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    // İlanın varlığını ve sahipliğini kontrol et
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        title: true,
        description: true,
        budgetMin: true,
        budgetMax: true
      }
    });
    
    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    // Sadece ilan sahibi teklifleri görebilir
    if (listing.userId !== userId) {
      return NextResponse.json(
        { error: 'Bu ilanın tekliflerini görme yetkiniz yok' },
        { status: 403 }
      );
    }

    // İlana gelen teklifleri getir
    const offers = await prisma.offer.findMany({
      where: {
        listingId: id
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
    });

    return NextResponse.json({
      success: true,
      offers,
      listing: {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        budgetMin: listing.budgetMin,
        budgetMax: listing.budgetMax
      }
    });
  } catch (error) {
    console.error('Error fetching listing offers:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}