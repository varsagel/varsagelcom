import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { checkBannedWords } from '../../banned-words/route';

const prisma = new PrismaClient();

// Konuşmanın mesajlarını getir
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;
    const conversationId = id;

    // Konuşmayı kontrol et ve kullanıcının erişim yetkisi var mı kontrol et
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        offer: {
          include: {
            listing: true
          }
        }
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Konuşma bulunamadı' }, { status: 404 });
    }

    // Kullanıcının bu konuşmaya erişim yetkisi var mı kontrol et
    const hasAccess = conversation.offer.userId === userId || conversation.offer.listing.userId === userId;
    if (!hasAccess) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    // Mesajları getir
    const messages = await prisma.message.findMany({
      where: {
        conversationId
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Okunmamış mesajları okundu olarak işaretle
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return NextResponse.json({
      conversation,
      messages
    });
  } catch (error) {
    console.error('Mesajlar getirilirken hata:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Yeni mesaj gönder
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;
    const conversationId = id;

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Mesaj içeriği gerekli' }, { status: 400 });
    }

    // Yasaklı kelime kontrolü
    const bannedWordsCheck = checkBannedWords(content);
    if (bannedWordsCheck.hasBannedWords) {
      return NextResponse.json({ 
        error: 'Mesajınızda uygunsuz içerik bulunmaktadır. Lütfen mesajınızı düzenleyerek tekrar deneyin.',
        bannedWords: bannedWordsCheck.bannedWords
      }, { status: 400 });
    }

    // Konuşmayı kontrol et ve kullanıcının erişim yetkisi var mı kontrol et
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        offer: {
          include: {
            listing: true
          }
        }
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Konuşma bulunamadı' }, { status: 404 });
    }

    // Kullanıcının bu konuşmaya erişim yetkisi var mı kontrol et
    const hasAccess = conversation.offer.userId === userId || conversation.offer.listing.userId === userId;
    if (!hasAccess) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    // Mesajı oluştur
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: userId,
        conversationId
      }
    });

    // Konuşmanın updatedAt'ini güncelle
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        updatedAt: new Date()
      }
    });

    // Mesaj alıcısını belirle ve bildirim oluştur
    const receiverId = conversation.offer.userId === userId 
      ? conversation.offer.listing.userId 
      : conversation.offer.userId;

    // Alıcıya bildirim gönder
    await prisma.notification.create({
      data: {
        type: 'new_message',
        message: `Yeni mesajınız var: "${content.trim().substring(0, 50)}${content.trim().length > 50 ? '...' : ''}"`,
        userId: receiverId,
        metadata: {
          conversationId,
          senderId: userId,
          messageId: message.id
        }
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Mesaj gönderilirken hata:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}