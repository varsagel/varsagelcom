import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Kullanıcının konuşmalarını getir
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;

    // Kullanıcının dahil olduğu konuşmaları getir
    const conversations = await prisma.conversation.findMany({
      where: {
        offer: {
          OR: [
            { userId: userId }, // Kullanıcının verdiği teklifler
            { listing: { userId: userId } } // Kullanıcının ilanlarına gelen teklifler
          ]
        }
      },
      include: {
        offer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true
              }
            },
            listing: {
              select: {
                id: true,
                title: true,
                userId: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    profileImage: true
                  }
                }
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Konuşmalar getirilirken hata:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Yeni konuşma oluştur (teklif kabul edildiğinde)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;

    const body = await request.json();
    const { offerId } = body;

    // Teklifi kontrol et
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        listing: true
      }
    });

    if (!offer) {
      return NextResponse.json({ error: 'Teklif bulunamadı' }, { status: 404 });
    }

    // Sadece ilan sahibi veya teklif veren kişi konuşma başlatabilir
    if (offer.userId !== userId && offer.listing.userId !== userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    // Teklif kabul edilmiş mi kontrol et
    if (offer.status !== 'accepted') {
      return NextResponse.json({ error: 'Sadece kabul edilmiş teklifler için mesajlaşma başlatılabilir' }, { status: 400 });
    }

    // Zaten konuşma var mı kontrol et
    const existingConversation = await prisma.conversation.findUnique({
      where: { offerId }
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    // Yeni konuşma oluştur
    const conversation = await prisma.conversation.create({
      data: {
        offerId
      },
      include: {
        offer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true
              }
            },
            listing: {
              select: {
                id: true,
                title: true,
                userId: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    profileImage: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Konuşma oluşturulurken hata:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}