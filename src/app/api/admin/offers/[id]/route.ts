import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserIdFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

// Admin yetkilerini kontrol eden email listesi
const ADMIN_EMAILS = [
  'admin@varsagel.com',
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const offerId = params.id;

    // Teklif detaylarını getir
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profileImage: true,
            createdAt: true,
            _count: {
              select: {
                offers: true,
                listings: true,
                reviews: true
              }
            }
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            price: true,
            status: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            },
            _count: {
              select: {
                offers: true,
                favorites: true,
                views: true
              }
            }
          }
        }
      }
    });

    if (!offer) {
      return NextResponse.json(
        { error: 'Teklif bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      offer
    });
  } catch (error) {
    console.error('Admin offer detail fetch error:', error);
    return NextResponse.json(
      { error: 'Teklif detayları getirilemedi' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const offerId = params.id;

    // Hedef teklifin var olup olmadığını kontrol et
    const targetOffer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        listing: {
          select: {
            userId: true,
            title: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!targetOffer) {
      return NextResponse.json(
        { error: 'Teklif bulunamadı' },
        { status: 404 }
      );
    }

    let updatedOffer;
    let notificationMessage = '';

    switch (action) {
      case 'accept':
        // Diğer bekleyen teklifleri reddet
        await prisma.offer.updateMany({
          where: {
            listingId: targetOffer.listingId,
            status: 'pending',
            id: { not: offerId }
          },
          data: { status: 'rejected' }
        });

        updatedOffer = await prisma.offer.update({
          where: { id: offerId },
          data: { status: 'accepted' }
        });

        notificationMessage = `Teklifiniz admin tarafından kabul edildi: ${targetOffer.listing.title}`;
        break;

      case 'reject':
        updatedOffer = await prisma.offer.update({
          where: { id: offerId },
          data: { status: 'rejected' }
        });

        notificationMessage = `Teklifiniz admin tarafından reddedildi: ${targetOffer.listing.title}`;
        break;

      case 'complete':
        if (targetOffer.status !== 'accepted') {
          return NextResponse.json(
            { error: 'Sadece kabul edilmiş teklifler tamamlanabilir' },
            { status: 400 }
          );
        }

        updatedOffer = await prisma.offer.update({
          where: { id: offerId },
          data: { status: 'completed' }
        });

        notificationMessage = `Teklifiniz admin tarafından tamamlandı olarak işaretlendi: ${targetOffer.listing.title}`;
        break;

      case 'cancel':
        updatedOffer = await prisma.offer.update({
          where: { id: offerId },
          data: { status: 'cancelled' }
        });

        // Eğer iptal edilen teklif kabul edilmiş durumdaysa, ilanı tekrar aktif hale getir
        if (targetOffer.status === 'accepted') {
          await prisma.listing.update({
            where: { id: targetOffer.listingId },
            data: { 
              status: 'active',
              updatedAt: new Date()
            }
          });
        }

        notificationMessage = `Teklifiniz admin tarafından iptal edildi: ${targetOffer.listing.title}`;
        break;

      default:
        return NextResponse.json(
          { error: 'Geçersiz işlem' },
          { status: 400 }
        );
    }

    // Bildirim oluştur
    if (notificationMessage) {
      await prisma.notification.create({
        data: {
          userId: targetOffer.userId,
          title: 'Teklif Durumu Güncellendi',
          message: notificationMessage,
          type: 'offer_update',
          relatedId: offerId
        }
      });
    }

    // Log kaydı oluştur
    await prisma.adminLog.create({
      data: {
        adminId: userId,
        action: `offer_${action}`,
        targetType: 'offer',
        targetId: offerId,
        details: {
          offerUser: targetOffer.user.name,
          listingTitle: targetOffer.listing.title,
          previousStatus: targetOffer.status,
          newStatus: updatedOffer.status
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }
    });

    return NextResponse.json({
      success: true,
      offer: updatedOffer,
      message: 'Teklif durumu güncellendi'
    });
  } catch (error) {
    console.error('Admin offer update error:', error);
    return NextResponse.json(
      { error: 'Teklif güncellenemedi' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const offerId = params.id;

    // Hedef teklifin var olup olmadığını kontrol et
    const targetOffer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        listing: {
          select: {
            title: true
          }
        },
        user: {
          select: {
            name: true
          }
        }
      }
    });

    if (!targetOffer) {
      return NextResponse.json(
        { error: 'Teklif bulunamadı' },
        { status: 404 }
      );
    }

    // Teklifi sil
    await prisma.offer.delete({
      where: { id: offerId }
    });

    // Log kaydı oluştur
    await prisma.adminLog.create({
      data: {
        adminId: userId,
        action: 'offer_delete',
        targetType: 'offer',
        targetId: offerId,
        details: {
          offerUser: targetOffer.user.name,
          listingTitle: targetOffer.listing.title,
          deletedStatus: targetOffer.status
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Teklif silindi'
    });
  } catch (error) {
    console.error('Admin offer delete error:', error);
    return NextResponse.json(
      { error: 'Teklif silinemedi' },
      { status: 500 }
    );
  }
}