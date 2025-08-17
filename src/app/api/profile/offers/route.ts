import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Kullanıcının verdiği teklifleri getir
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filtre koşulları
    const whereCondition: any = {
      userId: userId
    };

    if (status !== 'all') {
      whereCondition.status = status;
    }

    // Teklifleri getir
    const offers = await prisma.offer.findMany({
      where: whereCondition,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            description: true,
            budgetMin: true,
            budgetMax: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        conversation: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Toplam sayfa sayısını hesapla
    const totalOffers = await prisma.offer.count({
      where: whereCondition
    });
    const totalPages = Math.ceil(totalOffers / limit);

    // Veriyi formatla
    const formattedOffers = offers.map(offer => ({
      id: offer.id,
      listingId: offer.listingId,
      listingTitle: offer.listing.title,
      listingDescription: offer.listing.description,
      listingBudgetMin: offer.listing.budgetMin,
      listingBudgetMax: offer.listing.budgetMax,
      listingStatus: offer.listing.status,
      listingOwner: offer.listing.user,
      price: offer.price,
      duration: offer.duration,
      message: offer.message,
      status: offer.status,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
      conversationId: offer.conversation?.id || null
    }));

    return NextResponse.json({
      offers: formattedOffers,
      totalPages,
      currentPage: page,
      totalOffers
    });
  } catch (error) {
    console.error('Teklifler getirilirken hata:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}