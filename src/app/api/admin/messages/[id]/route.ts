import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAILS = ['admin@varsagel.com'];

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const messageId = id;

    // Mesajı sil
    await prisma.message.delete({
      where: {
        id: messageId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Mesaj başarıyla silindi'
    });

  } catch (error) {
    console.error('Mesaj silme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const messageId = id;

    // Mesaj detaylarını getir
    const message = await prisma.message.findUnique({
      where: {
        id: messageId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        conversation: {
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                price: true,
                category: true
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
            }
          }
        }
      }
    });

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Mesaj bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message
    });

  } catch (error) {
    console.error('Mesaj detay hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}