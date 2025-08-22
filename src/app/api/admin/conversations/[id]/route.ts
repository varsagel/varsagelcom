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
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    const userId = await getUserIdFromToken(token);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });
    
    if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const conversationId = id;

    // Önce konuşmaya ait mesajları sil
    await prisma.message.deleteMany({
      where: {
        conversationId: conversationId
      }
    });

    // Sonra konuşmayı sil
    await prisma.conversation.delete({
      where: {
        id: conversationId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Konuşma başarıyla silindi'
    });

  } catch (error) {
    console.error('Konuşma silme hatası:', error);
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
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    const userId = await getUserIdFromToken(token);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });
    
    if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const conversationId = id;

    // Konuşma detaylarını getir
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            category: true,
            images: true
          }
        },
        offer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
              }
            },
            listing: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true
                  }
                }
              }
            }
          }
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      }
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Konuşma bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      conversation
    });

  } catch (error) {
    console.error('Konuşma detay hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}