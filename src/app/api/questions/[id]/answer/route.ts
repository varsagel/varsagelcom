import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Soruya cevap ver
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;
    const questionId = params.id;

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Cevap içeriği gerekli' }, { status: 400 });
    }

    // Soruyu ve ilgili ilanı getir
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        listing: true,
        answer: true
      }
    });

    if (!question) {
      return NextResponse.json({ error: 'Soru bulunamadı' }, { status: 404 });
    }

    // Sadece ilan sahibi cevap verebilir
    if (question.listing.userId !== userId) {
      return NextResponse.json({ error: 'Bu soruya sadece ilan sahibi cevap verebilir' }, { status: 403 });
    }

    // Zaten cevap verilmiş mi kontrol et
    if (question.answer) {
      return NextResponse.json({ error: 'Bu soru zaten cevaplanmış' }, { status: 400 });
    }

    // Cevap oluştur
    const answer = await prisma.answer.create({
      data: {
        content: content.trim(),
        questionId,
        responderId: userId
      }
    });

    const formattedAnswer = {
      content: answer.content,
      createdAt: answer.createdAt.toISOString()
    };

    return NextResponse.json({ answer: formattedAnswer }, { status: 201 });
  } catch (error) {
    console.error('Cevap oluşturulurken hata:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}