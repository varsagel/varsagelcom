import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Mesajı okundu olarak işaretle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const { id: conversationId, messageId } = await params;
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;

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

    // Mesajı kontrol et
    const message = await prisma.message.findUnique({
      where: {
        id: messageId,
        conversationId
      }
    });

    if (!message) {
      return NextResponse.json({ error: 'Mesaj bulunamadı' }, { status: 404 });
    }

    // Sadece kendi mesajı olmayan mesajları okundu olarak işaretleyebilir
    if (message.senderId === userId) {
      return NextResponse.json({ error: 'Kendi mesajınızı okundu olarak işaretleyemezsiniz' }, { status: 400 });
    }

    // Mesajı okundu olarak işaretle
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true }
    });

    return NextResponse.json({
      success: true,
      message: updatedMessage
    });
  } catch (error) {
    console.error('Mesaj okundu olarak işaretlenirken hata:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}