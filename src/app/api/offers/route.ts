import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Kullanıcıyı veritabanından bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { listingId, amount, message, categorySpecificData } = body;

    // İlanın var olduğunu ve aktif olduğunu kontrol et
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { user: true }
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    if (listing.status !== 'active') {
      return NextResponse.json(
        { error: 'Bu ilan artık aktif değil' },
        { status: 400 }
      );
    }

    // Kendi ilanına teklif veremez
    if (listing.userId === user.id) {
      return NextResponse.json(
        { error: 'Kendi ilanınıza teklif veremezsiniz' },
        { status: 400 }
      );
    }

    // Daha önce teklif verip vermediğini kontrol et
    const existingOffer = await prisma.offer.findFirst({
      where: {
        listingId,
        sellerId: user.id
      }
    });

    if (existingOffer) {
      return NextResponse.json(
        { error: 'Bu ilana zaten teklif verdiniz' },
        { status: 400 }
      );
    }

    // Yeni teklif oluştur
    const newOffer = await prisma.offer.create({
      data: {
        listingId,
        sellerId: user.id,
        buyerId: listing.userId,
        amount,
        price: amount,
        description: message || '',
        status: 'pending',
        offerNumber: `OFF-${Date.now()}`,
        categorySpecificData: JSON.stringify(categorySpecificData || {}),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 gün sonra
      },
      select: {
        id: true,
        amount: true,
        description: true,
        status: true,
        createdAt: true,
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
            minPrice: true,
            maxPrice: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        }
      }
    });

    // İlan sahibine bildirim oluştur
    await prisma.notification.create({
      data: {
        userId: listing.userId,
        type: 'new_offer',
        title: 'Yeni Teklif',
        message: `"${listing.title}" ilanınıza ${amount} TL teklif verildi`,
        relatedId: newOffer.id,
        isRead: false
      }
    });

    return NextResponse.json(newOffer, { status: 201 });
  } catch (error) {
    console.error('Teklif oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Teklif oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Kullanıcıyı veritabanından bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'sent' veya 'received'
    const listingId = searchParams.get('listingId');
    const status = searchParams.get('status'); // 'pending', 'accepted', 'rejected', etc.

    let whereClause: any = {};

    if (type === 'sent') {
      whereClause.sellerId = user.id;
    } else if (type === 'received') {
      whereClause.listing = {
        userId: user.id
      };
    }

    if (listingId) {
      whereClause.listingId = listingId;
    }

    if (status) {
      whereClause.status = status;
    }

    const offers = await prisma.offer.findMany({
      where: whereClause,
      select: {
        id: true,
        amount: true,
        description: true,
        status: true,
        createdAt: true,
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
            minPrice: true,
            maxPrice: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(offers);
  } catch (error) {
    console.error('Teklifleri getirme hatası:', error);
    return NextResponse.json(
      { error: 'Teklifler getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}