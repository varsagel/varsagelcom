import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await params;

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

    // Belirli kullanıcıdan gelen okunmamış mesajları okundu olarak işaretle
    const updatedMessages = await prisma.message.updateMany({
      where: {
        senderId: userId,
        receiverId: user.id,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      updatedCount: updatedMessages.count 
    });

  } catch (error) {
    console.error('Mesajları okundu olarak işaretleme hatası:', error);
    return NextResponse.json(
      { error: 'Mesajlar okundu olarak işaretlenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}