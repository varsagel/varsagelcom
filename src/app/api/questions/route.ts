import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Soru sormak için giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const { listingId, question } = await request.json();

    if (!listingId || !question?.trim()) {
      return NextResponse.json(
        { error: 'İlan ID ve soru metni gereklidir' },
        { status: 400 }
      );
    }

    // İlanın var olup olmadığını kontrol et
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, userId: true, title: true }
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcının kendi ilanına soru sormasını engelle
    if (listing.userId === session.user.id) {
      return NextResponse.json(
        { error: 'Kendi ilanınıza soru soramazsınız' },
        { status: 400 }
      );
    }

    // Soruyu veritabanına kaydet
    const newQuestion = await prisma.question.create({
      data: {
        question: question.trim(),
        listingId: listingId,
        askerId: session.user.id,
        ownerId: listing.userId,
      },
      include: {
        asker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    // İlan sahibine bildirim gönder
    await prisma.notification.create({
      data: {
        type: 'question_asked',
        title: 'Yeni Soru',
        message: `"${listing.title}" ilanınız için yeni bir soru geldi`,
        userId: listing.userId,
        relatedId: newQuestion.id
      }
    });

    return NextResponse.json({
      message: 'Soru başarıyla gönderildi',
      question: newQuestion
    });

  } catch (error) {
    console.error('Soru gönderme hatası:', error);
    return NextResponse.json(
      { error: 'Soru gönderilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      return NextResponse.json(
        { error: 'İlan ID gereklidir' },
        { status: 400 }
      );
    }

    const questions = await prisma.question.findMany({
      where: { 
        listingId: listingId,
        isPublic: true
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
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ questions });

  } catch (error) {
    console.error('Soruları getirme hatası:', error);
    return NextResponse.json(
      { error: 'Sorular getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}