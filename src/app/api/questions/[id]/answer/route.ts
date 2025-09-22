import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Cevap vermek için giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const { answer } = await request.json();

    if (!answer?.trim()) {
      return NextResponse.json(
        { error: 'Cevap metni gereklidir' },
        { status: 400 }
      );
    }

    // Sorunun var olup olmadığını ve kullanıcının ilan sahibi olup olmadığını kontrol et
    const { id } = await params;
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            userId: true
          }
        },
        asker: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Soru bulunamadı' },
        { status: 404 }
      );
    }

    // Sadece ilan sahibi cevap verebilir
    if (question.listing.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Bu soruya sadece ilan sahibi cevap verebilir' },
        { status: 403 }
      );
    }

    // Zaten cevaplandırılmış mı kontrol et
    if (question.isAnswered) {
      return NextResponse.json(
        { error: 'Bu soru zaten cevaplandırılmış' },
        { status: 400 }
      );
    }

    // Cevabı güncelle
    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        answer: answer.trim(),
        isAnswered: true,
        answeredAt: new Date()
      },
      include: {
        asker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        listing: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    // Soru soran kişiye bildirim gönder
    await prisma.notification.create({
      data: {
        type: 'question_answered',
        title: 'Sorunuz Cevaplandı',
        message: `"${question.listing.title}" ilanı için sorduğunuz soru cevaplandı`,
        userId: question.askerId,
        relatedId: question.listing.id
      }
    });

    return NextResponse.json({
      message: 'Cevap başarıyla gönderildi',
      question: updatedQuestion
    });

  } catch (error) {
    console.error('Cevap gönderme hatası:', error);
    return NextResponse.json(
      { error: 'Cevap gönderilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}