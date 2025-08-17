import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserIdFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

// Kullanıcının okunmamış mesaj sayısını getir
export async function GET(request: NextRequest) {
  try {
    // Kullanıcı ID'sini al
    const userId = await getUserIdFromToken(request.headers);
    
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
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });
    
    // Okunmamış mesaj sayısını hesapla
    let unreadCount = 0;
    
    conversations.forEach(conversation => {
      const lastMessage = conversation.messages[0];
      if (lastMessage && !lastMessage.isRead && lastMessage.senderId !== userId) {
        unreadCount++;
      }
    });
    
    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching unread message count' },
      { status: 500 }
    );
  }
}