import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin kontrolü
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Kullanıcıları getir
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            listings: true,
            sellerOffers: true,
            buyerOffers: true,
            sentMessages: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Mesaj sayısını düzelt ve offers sayısını birleştir
    const usersWithCounts = users.map((user: any) => ({
      ...user,
      _count: {
        listings: user._count.listings,
        offers: user._count.sellerOffers + user._count.buyerOffers,
        messages: user._count.sentMessages,
      },
    }));

    return NextResponse.json(usersWithCounts);
  } catch (error) {
    console.error('Kullanıcılar getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}