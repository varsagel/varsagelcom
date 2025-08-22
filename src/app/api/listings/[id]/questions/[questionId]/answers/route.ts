import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Cevap ekle
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string, questionId: string }> }) {
  const { id, questionId } = await params;
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;
    const listingId = id;

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Cevap içeriği gerekli' }, { status: 400 });
    }

    // Sorunun var olup olmadığını ve ilgili ilan bilgilerini kontrol et
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            userId: true
          }
        }
      }
    });

    if (!question) {
      return NextResponse.json({ error: 'Soru bulunamadı' }, { status: 404 });
    }

    if (question.listing.id !== listingId) {
      return NextResponse.json({ error: 'Soru bu ilana ait değil' }, { status: 400 });
    }

    // Sadece ilan sahibi cevap verebilir
    if (question.listing.userId !== userId) {
      return NextResponse.json({ error: 'Bu soruya sadece ilan sahibi cevap verebilir' }, { status: 403 });
    }

    // Zaten cevap verilmiş mi kontrol et
    const existingAnswer = await prisma.answer.findUnique({
      where: { questionId }
    });

    if (existingAnswer) {
      return NextResponse.json({ error: 'Bu soru zaten cevaplanmış' }, { status: 400 });
    }

    // Yeni cevap oluştur
    const answer = await prisma.answer.create({
      data: {
        content: content.trim(),
        questionId,
        responderId: userId
      },
      include: {
        responder: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    });

    // Soru soran kişiye bildirim gönder
    await prisma.notification.create({
      data: {
        userId: question.askerId,
        type: 'question_answered',
        message: `"${question.listing.title}" ilanı hakkında sorduğunuz soruya ${answer.responder.name} tarafından cevap verildi.`,
        metadata: {
          listingId: question.listing.id,
          questionId: questionId,
          answerId: answer.id,
          responderName: answer.responder.name
        }
      }
    });

    const formattedAnswer = {
      id: answer.id,
      content: answer.content,
      responderName: answer.responder.name,
      responderImage: answer.responder.profileImage,
      createdAt: answer.createdAt.toISOString()
    };

    return NextResponse.json({ answer: formattedAnswer }, { status: 201 });
  } catch (error) {
    console.error('Cevap oluşturulurken hata:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}