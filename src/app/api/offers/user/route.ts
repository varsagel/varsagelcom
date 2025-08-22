import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Yetkilendirme tokeni gerekli' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: 'Sunucu yapılandırma hatası' },
        { status: 500 }
      );
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    const decoded = payload as { userId: string };
    
    const offers = await prisma.offer.findMany({
      where: {
        userId: decoded.userId
      },
      include: {
        listing: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedOffers = offers.map(offer => ({
      id: offer.id,
      listingId: offer.listingId,
      listingTitle: offer.listing.title,
      price: offer.price,
      status: offer.status,
      createdAt: offer.createdAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      offers: formattedOffers
    });

  } catch (error) {
    console.error('Error fetching user offers:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}