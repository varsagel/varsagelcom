import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAILS = ['admin@varsagel.com'];

export async function GET(request: NextRequest) {
  try {
    // Token'dan kullanıcı ID'sini al
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header gerekli' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const userId = await getUserIdFromToken(token);
    
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
      whereCondition.OR = [
        {
          listing: {
            title: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          participants: {
            some: {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: 'insensitive'
                  }
                },
                {
                  email: {
                    contains: search,
                    mode: 'insensitive'
                  }
                }
              ]
            }
          }
        }
      ];
    }
    
    if (filter === 'reported') {
      whereCondition.messages = {
        some: {
          isReported: true
        }
      };
    } else if (filter === 'recent') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      whereCondition.updatedAt = {
        gte: yesterday
      };
    }

    // Toplam sayı
    const totalCount = await prisma.conversation.count({
      where: whereCondition
    });

    // Konuşmaları getir
    const conversations = await prisma.conversation.findMany({
      where: whereCondition,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true
          }
        },
        offer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            listing: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            messages: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            sender: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      skip: offset,
      take: limit
    });

    // Son mesajı düzenle ve participants alanını ekle
    const conversationsWithLastMessage = conversations.map(conversation => ({
      ...conversation,
      participants: [
        conversation.offer.user, // Teklif veren kullanıcı
        conversation.offer.listing.user // İlan sahibi kullanıcı
      ],
      lastMessage: conversation.messages[0] || null,
      messages: undefined // messages array'ini kaldır, sadece lastMessage kullan
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      conversations: conversationsWithLastMessage,
      totalPages,
      currentPage: page,
      totalCount
    });

  } catch (error) {
    console.error('Konuşmalar API hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}