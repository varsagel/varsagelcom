import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Tek soru getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
            id: true,
            listingNumber: true,
            title: true,
            userId: true
          }
        },
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
      }
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Soru bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(question);

  } catch (error) {
    console.error('Soru getirme hatası:', error);
    return NextResponse.json(
      { error: 'Soru getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}