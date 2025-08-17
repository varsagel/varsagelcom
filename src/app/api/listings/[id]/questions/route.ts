import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Soruları getir
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const listingId = id;

    // İlanın var olup olmadığını kontrol et
    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    });

    if (!listing) {
      return NextResponse.json({ error: 'İlan bulunamadı' }, { status: 404 });
    }

    // Soruları getir
    const questions = await prisma.question.findMany({
      where: { listingId },
      include: {
        asker: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        },
        answer: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Soruları formatla
    const formattedQuestions = questions.map(question => ({
      id: question.id,
      content: question.content,
      askerName: question.asker.name,
      askerImage: question.asker.profileImage,
      createdAt: question.createdAt.toISOString(),
      answer: question.answer ? {
        content: question.answer.content,
        createdAt: question.answer.createdAt.toISOString()
      } : null
    }));

    return NextResponse.json({ questions: formattedQuestions });
  } catch (error) {
    console.error('Sorular getirilirken hata:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Yeni soru ekle
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;
    const { id } = await params;
    const listingId = id;

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Soru içeriği gerekli' }, { status: 400 });
    }

    // İlanın var olup olmadığını kontrol et
    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    });

    if (!listing) {
      return NextResponse.json({ error: 'İlan bulunamadı' }, { status: 404 });
    }

    // Kullanıcının kendi ilanına soru sormasını engelle
    if (listing.userId === userId) {
      return NextResponse.json({ error: 'Kendi ilanınıza soru soramazsınız' }, { status: 400 });
    }

    // Yeni soru oluştur
    const question = await prisma.question.create({
      data: {
        content: content.trim(),
        listingId,
        askerId: userId
      },
      include: {
        asker: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    });

    // İlan sahibine bildirim gönder
    await prisma.notification.create({
      data: {
        userId: listing.userId,
        type: 'new_question',
        message: `"${listing.title}" ilanınıza ${question.asker.name} tarafından yeni bir soru soruldu.`,
        metadata: {
          listingId: listingId,
          questionId: question.id,
          askerName: question.asker.name
        }
      }
    });

    const formattedQuestion = {
      id: question.id,
      content: question.content,
      askerName: question.asker.name,
      askerImage: question.asker.profileImage,
      createdAt: question.createdAt.toISOString(),
      answer: null
    };

    return NextResponse.json({ question: formattedQuestion }, { status: 201 });
  } catch (error) {
    console.error('Soru oluşturulurken hata:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}