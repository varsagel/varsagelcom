import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      subcategory,
      minPrice,
      maxPrice,
      city,
      district,
      urgency,
      condition,
      specifications
    } = body;

    // Validation
    if (!title || !description || !category || !subcategory || !minPrice || !maxPrice || !city || !district || !condition || !urgency) {
      return NextResponse.json(
        { error: 'Tüm gerekli alanları doldurun' },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Alıcı ilanını oluştur
    const buyerListing = await prisma.buyerListing.create({
      data: {
        title,
        description,
        category,
        subcategory,
        minPrice: parseFloat(minPrice),
        maxPrice: parseFloat(maxPrice),
        city,
        district,
        urgency,
        condition,
        specifications: specifications || {},
        userId: user.id,
        status: 'active'
      }
    });

    return NextResponse.json(buyerListing, { status: 201 });

  } catch (error) {
    console.error('Alıcı ilanı oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'İlan oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const urgency = searchParams.get('urgency');

    const skip = (page - 1) * limit;

    // Filtreleme koşulları
    const where: any = {
      status: 'active'
    };

    if (category) {
      where.category = category;
    }

    if (city) {
      where.city = city;
    }

    if (minPrice) {
      where.minPrice = {
        gte: parseFloat(minPrice)
      };
    }

    if (maxPrice) {
      where.maxPrice = {
        lte: parseFloat(maxPrice)
      };
    }

    if (urgency) {
      where.urgency = urgency;
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // İlanları getir
    const [buyerListings, total] = await Promise.all([
      prisma.buyerListing.findMany({
        where,
        include: {
          user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.buyerListing.count({ where })
    ]);

    return NextResponse.json({
      buyerListings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Alıcı ilanları getirme hatası:', error);
    return NextResponse.json(
      { error: 'İlanlar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}