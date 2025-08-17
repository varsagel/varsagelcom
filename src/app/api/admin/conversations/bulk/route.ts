import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAILS = ['admin@varsagel.com'];

export async function DELETE(request: NextRequest) {
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

    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz ID listesi' },
        { status: 400 }
      );
    }

    // Önce konuşmalara ait mesajları sil
    await prisma.message.deleteMany({
      where: {
        conversationId: {
          in: ids
        }
      }
    });

    // Sonra konuşmaları toplu sil
    const result = await prisma.conversation.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} konuşma başarıyla silindi`,
      deletedCount: result.count
    });

  } catch (error) {
    console.error('Toplu konuşma silme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}