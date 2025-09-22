import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    // Kullanıcının tüm mesajlarını al ve konuşmaları grupla
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Konuşmaları grupla
    const conversationsMap = new Map();

    for (const message of messages) {
      const otherUserId = message.senderId === user.id ? message.receiverId : message.senderId;
      const otherUser = message.senderId === user.id ? message.receiver : message.sender;

      if (!conversationsMap.has(otherUserId)) {
        // Bu konuşmadaki okunmamış mesaj sayısını hesapla
        const unreadCount = await prisma.message.count({
          where: {
            senderId: otherUserId,
            receiverId: user.id,
            isRead: false
          }
        });

        conversationsMap.set(otherUserId, {
          id: otherUserId,
          otherUser: {
            id: otherUser.id,
            name: `${otherUser.firstName} ${otherUser.lastName}`,
            email: otherUser.email,
            image: otherUser.avatar
          },
          lastMessage: {
            content: message.content,
            createdAt: message.createdAt,
            isRead: message.isRead,
            senderId: message.senderId
          },
          unreadCount
        });
      }
    }

    // Map'i array'e çevir ve tarihe göre sırala
    const conversations = Array.from(conversationsMap.values()).sort((a, b) => 
      new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );

    return NextResponse.json(conversations);

  } catch (error) {
    console.error('Konuşmaları getirme hatası:', error);
    return NextResponse.json(
      { error: 'Konuşmalar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}