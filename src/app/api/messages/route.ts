import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { receiverId, content, messageType = 'text', offerId, listingId } = body;

    // Validation
    if (!receiverId || !content) {
      return NextResponse.json(
        { error: 'Alıcı ve mesaj içeriği gerekli' },
        { status: 400 }
      );
    }

    // Gönderen kullanıcıyı bul
    const sender = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!sender) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Alıcı kullanıcıyı kontrol et
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });

    if (!receiver) {
      return NextResponse.json(
        { error: 'Alıcı kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Mesajı oluştur
    const message = await prisma.message.create({
      data: {
        content,
        messageType,
        senderId: sender.id,
        receiverId,
        offerId: offerId || null,
        listingId: listingId || null,
        isRead: false
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
      }
    });

    // Bildirim oluştur
    await prisma.notification.create({
      data: {
        userId: receiverId,
        title: 'Yeni Mesaj',
        message: `${sender.firstName} ${sender.lastName} size bir mesaj gönderdi`,
        type: 'message_received',
        relatedId: message.id,
        isRead: false
      }
    });

    // Mesajı döndür (name alanını firstName + lastName olarak oluştur)
    const responseMessage = {
      ...message,
      sender: {
        ...message.sender,
        name: `${message.sender.firstName} ${message.sender.lastName}`,
        image: message.sender.avatar
      },
      receiver: {
        ...message.receiver,
        name: `${message.receiver.firstName} ${message.receiver.lastName}`,
        image: message.receiver.avatar
      }
    };

    return NextResponse.json(responseMessage, { status: 201 });

  } catch (error) {
    console.error('Mesaj gönderme hatası:', error);
    return NextResponse.json(
      { error: 'Mesaj gönderilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const userId = searchParams.get('userId');

    const skip = (page - 1) * limit;

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

    let where: any = {
      OR: [
        { senderId: user.id },
        { receiverId: user.id }
      ]
    };

    // Belirli bir kullanıcı ile mesajlaşma
    if (userId) {
      where = {
        OR: [
          { senderId: user.id, receiverId: userId },
          { senderId: userId, receiverId: user.id }
        ]
      };
    }

    // Mesajları getir
    const messages = await prisma.message.findMany({
      where,
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
        createdAt: 'asc'
      },
      skip,
      take: limit
    });

    // Mesajları formatla
    const formattedMessages = messages.map((message: any) => ({
      ...message,
      sender: {
        ...message.sender,
        name: `${message.sender.firstName} ${message.sender.lastName}`,
        image: message.sender.avatar
      },
      receiver: {
        ...message.receiver,
        name: `${message.receiver.firstName} ${message.receiver.lastName}`,
        image: message.receiver.avatar
      }
    }));

    return NextResponse.json(formattedMessages);

  } catch (error) {
    console.error('Mesajları getirme hatası:', error);
    return NextResponse.json(
      { error: 'Mesajlar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}