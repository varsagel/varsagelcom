import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserId } from '@/lib/auth';

const prisma = new PrismaClient();

// Favori ekle
export async function POST(request: NextRequest) {
  try {
    // Kullanıcı ID'sini al
    const userId = getUserId(request.headers);
    
    // Request body'den verileri al
    const body = await request.json();
    const { listingId } = body;
    
    // Zorunlu alanları kontrol et
    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }
    
    // İlanın varlığını kontrol et
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });
    
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // Favori zaten var mı kontrol et
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId,
        listingId,
      },
    });
    
    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Listing is already in favorites' },
        { status: 400 }
      );
    }
    
    // Favori oluştur
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        listingId,
      },
    });
    
    // İlanın favori sayısını güncelle
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        favoriteCount: { increment: 1 },
      },
    });
    
    return NextResponse.json(
      { message: 'Added to favorites successfully', favorite },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json(
      { error: 'An error occurred while adding to favorites' },
      { status: 500 }
    );
  }
}

// Kullanıcının favorilerini getir
export async function GET(request: NextRequest) {
  try {
    // Kullanıcı ID'sini al
    const userId = getUserId(request.headers);
    
    // Sayfalama parametreleri
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Kullanıcının favorilerini getir
    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          listing: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true,
                  rating: true,
                  reviewCount: true,
                },
              },
              _count: {
                select: {
                  offers: true,
                  favorites: true,
                },
              },
            },
          },
        },
      }),
      prisma.favorite.count({ where: { userId } }),
    ]);
    
    // Toplam sayfa sayısı
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      favorites,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching favorites' },
      { status: 500 }
    );
  }
}