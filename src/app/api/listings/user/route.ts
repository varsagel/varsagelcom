import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { PrismaClient } from '@prisma/client';

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
    
    const listings = await prisma.listing.findMany({
      where: {
        userId: decoded.userId
      },
      include: {
        _count: {
          select: {
            offers: true,
            favorites: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedListings = listings.map(listing => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      category: listing.category,
      location: listing.location,
      budgetMin: listing.budgetMin,
      budgetMax: listing.budgetMax,
      images: listing.images ? JSON.parse(listing.images) : [],
      status: listing.status,
      createdAt: listing.createdAt.toISOString(),
      offersCount: listing._count.offers,
      favoritesCount: listing._count.favorites
    }));

    return NextResponse.json({
      success: true,
      listings: formattedListings
    });

  } catch (error) {
    console.error('Error fetching user listings:', error);
    
    if (error instanceof Error && (error.name === 'JWTExpired' || error.name === 'JWTInvalid')) {
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