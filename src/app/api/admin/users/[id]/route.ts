import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserIdFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

// Admin yetkilerini kontrol eden email listesi
const ADMIN_EMAILS = [
  'admin@varsagel.com',
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Token'dan kullanıcı ID'sini al
    const userId = await getUserIdFromToken(request.headers);
    
    // Kullanıcıyı veritabanından getir ve admin yetkisi kontrol et
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json(
        { error: 'Admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const { action } = await request.json();
    const targetUserId = id;

    // Hedef kullanıcının var olup olmadığını kontrol et
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Admin kullanıcısının kendisini yasaklamasını engelle
    if (targetUser.email === user.email && action === 'ban') {
      return NextResponse.json(
        { error: 'Kendinizi yasaklayamazsınız' },
        { status: 400 }
      );
    }

    let updatedUser;

    switch (action) {
      case 'ban':
        updatedUser = await prisma.user.update({
          where: { id: targetUserId },
          data: { isBanned: true }
        });
        break;

      case 'unban':
        updatedUser = await prisma.user.update({
          where: { id: targetUserId },
          data: { isBanned: false }
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Geçersiz işlem' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Kullanıcı başarıyla ${action === 'ban' ? 'yasaklandı' : 'yasağı kaldırıldı'}`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Admin user action error:', error);
    return NextResponse.json(
      { error: 'Kullanıcı işlemi sırasında hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Token'dan kullanıcı ID'sini al
    const userId = await getUserIdFromToken(request.headers);
    
    // Kullanıcıyı veritabanından getir ve admin yetkisi kontrol et
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json(
        { error: 'Admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const targetUserId = id;

    // Hedef kullanıcının var olup olmadığını kontrol et
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Admin kullanıcısının kendisini silmesini engelle
    if (targetUser.email === user.email) {
      return NextResponse.json(
        { error: 'Kendinizi silemezsiniz' },
        { status: 400 }
      );
    }

    // Kullanıcıyı ve ilişkili verileri sil (CASCADE)
    await prisma.$transaction(async (tx) => {
      // Önce bağımlı kayıtları sil
      await tx.listingView.deleteMany({
        where: { userId: targetUserId }
      });
      
      await tx.favorite.deleteMany({
        where: { userId: targetUserId }
      });
      
      await tx.review.deleteMany({
        where: {
          OR: [
            { reviewerId: targetUserId },
            { userId: targetUserId }
          ]
        }
      });
      
      await tx.answer.deleteMany({
        where: { responderId: targetUserId }
      });
      
      await tx.question.deleteMany({
        where: { askerId: targetUserId }
      });
      
      await tx.message.deleteMany({
        where: { senderId: targetUserId }
      });
      
      // Delete conversations where user is involved through offers
      const userOffers = await tx.offer.findMany({
        where: { userId: targetUserId },
        select: { id: true }
      });
      
      if (userOffers.length > 0) {
        await tx.conversation.deleteMany({
          where: {
            offerId: {
              in: userOffers.map(offer => offer.id)
            }
          }
        });
      }
      
      await tx.notification.deleteMany({
        where: { userId: targetUserId }
      });
      
      await tx.offer.deleteMany({
        where: { userId: targetUserId }
      });
      
      await tx.listing.deleteMany({
        where: { userId: targetUserId }
      });
      
      // Son olarak kullanıcıyı sil
      await tx.user.delete({
        where: { id: targetUserId }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı ve tüm verileri başarıyla silindi'
    });
  } catch (error) {
    console.error('Admin user delete error:', error);
    return NextResponse.json(
      { error: 'Kullanıcı silinirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Token'dan kullanıcı ID'sini al
    const userId = await getUserIdFromToken(request.headers);
    
    // Kullanıcıyı veritabanından getir ve admin yetkisi kontrol et
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json(
        { error: 'Admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const targetUserId = id;

    // Kullanıcı detaylarını getir
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        _count: {
          select: {
            listings: true,
            offers: true,
            reviews: true,
            favorites: true
          }
        },
        listings: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        },
        offers: {
          select: {
            id: true,
            price: true,
            status: true,
            createdAt: true,
            listing: {
              select: {
                title: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: targetUser
    });
  } catch (error) {
    console.error('Admin user detail error:', error);
    return NextResponse.json(
      { error: 'Kullanıcı detayları alınırken hata oluştu' },
      { status: 500 }
    );
  }
}