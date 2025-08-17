import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserId } from '@/lib/auth';

const prisma = new PrismaClient();

// Kullanıcının ilanlarını getir
export async function GET(request: NextRequest) {
  try {
    // Kullanıcı ID'sini al
    const userId = getUserId(request.headers);
    
    // Filtreleme parametreleri
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // active, expired, closed
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Filtreleme koşulları
    const where: any = { userId };
    
    if (status === 'accepted') {
      // Kabul edilen teklifi olan ilanları getir
      where.offers = {
        some: {
          status: 'accepted'
        }
      };
    } else if (status) {
      where.status = status;
      // Kabul edilen teklifi olmayan ilanları getir (diğer statuslar için)
      if (status === 'active') {
        where.offers = {
          none: {
            status: 'accepted'
          }
        };
      }
    }
    
    // Sayfalama
    const skip = (page - 1) * limit;
    
    // İlanları getir
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              offers: true,
              favorites: true,
            },
          },
        },
      }),
      prisma.listing.count({ where }),
    ]);
    
    // Toplam sayfa sayısı
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      listings,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching user listings:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching user listings' },
      { status: 500 }
    );
  }
}