import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Kullanıcının ilanlarını getir
    const listings = await prisma.listing.findMany({
      where: {
        userId: user.id
      },
      select: {
        id: true,
        title: true,
        description: true,
        minPrice: true,
        maxPrice: true,
        location: true,
        categoryId: true,
        subCategoryId: true,
        images: true,
        status: true,
        views: true,
        createdAt: true,
        _count: {
          select: {
            offers: true,
            favorites: true,
            questions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error('Kullanıcı ilanları getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}