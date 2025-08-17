import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAILS = ['admin@varsagel.com'];

export async function GET(request: NextRequest) {
  try {
    // Token'dan kullanıcı ID'sini al
    const userId = await getUserIdFromToken(request.headers);
    
    // Kullanıcıyı veritabanından getir ve admin yetkisi kontrol et
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json(
        { error: 'Admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || 'all';
    const limit = 20;
    const offset = (page - 1) * limit;

    // Filtreleme koşulları
    let whereCondition: any = {};
    
    if (search) {
      whereCondition.content = {
        contains: search,
        mode: 'insensitive'
      };
    }
    
    if (filter === 'reported') {
      whereCondition.isReported = true;
    } else if (filter === 'recent') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      whereCondition.createdAt = {
        gte: yesterday
      };
    }

    // Toplam sayı
    const totalCount = await prisma.message.count({
      where: whereCondition
    });

    // Mesajları getir
    const messages = await prisma.message.findMany({
      where: whereCondition,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        conversation: {
          include: {
            listing: {
              select: {
                id: true,
                title: true
              }
            },
            participants: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      messages,
      totalPages,
      currentPage: page,
      totalCount
    });

  } catch (error) {
    console.error('Mesajlar API hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}