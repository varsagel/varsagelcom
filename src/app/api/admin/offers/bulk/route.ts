import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserIdFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

// Admin yetkilerini kontrol eden email listesi
const ADMIN_EMAILS = [
  'admin@varsagel.com',
];

export async function POST(request: NextRequest) {
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

    const { offerIds, action } = await request.json();

    if (!Array.isArray(offerIds) || offerIds.length === 0) {
      return NextResponse.json(
        { error: 'Geçerli teklif ID\'leri gerekli' },
        { status: 400 }
      );
    }

    if (!['accept', 'reject', 'delete', 'complete', 'cancel'].includes(action)) {
      return NextResponse.json(
        { error: 'Geçersiz işlem' },
        { status: 400 }
      );
    }

    // Hedef tekliflerin var olup olmadığını kontrol et
    const targetOffers = await prisma.offer.findMany({
      where: {
        id: { in: offerIds }
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (targetOffers.length !== offerIds.length) {
      return NextResponse.json(
        { error: 'Bazı teklifler bulunamadı' },
        { status: 404 }
      );
    }

    let updatedCount = 0;
    let deletedCount = 0;
    const results = [];

    if (action === 'delete') {
      // Toplu silme işlemi
      const deleteResult = await prisma.offer.deleteMany({
        where: {
          id: { in: offerIds }
        }
      });
      
      deletedCount = deleteResult.count;

      // Her silinen teklif için log kaydı oluştur
      for (const offer of targetOffers) {
        await prisma.adminLog.create({
          data: {
            adminId: userId,
            action: 'offer_bulk_delete',
            targetType: 'offer',
            targetId: offer.id,
            details: {
              offerUser: offer.user.name,
              listingTitle: offer.listing.title,
              deletedStatus: offer.status,
              bulkOperation: true
            }
          }
        });
      }
    } else {
      // Durum güncelleme işlemleri
      let newStatus: string;
      let notificationTitle: string;
      let notificationMessage: string;

      switch (action) {
        case 'accept':
          newStatus = 'accepted';
          notificationTitle = 'Teklif Kabul Edildi';
          notificationMessage = 'Teklifiniz admin tarafından kabul edildi';
          break;
        case 'reject':
          newStatus = 'rejected';
          notificationTitle = 'Teklif Reddedildi';
          notificationMessage = 'Teklifiniz admin tarafından reddedildi';
          break;
        case 'complete':
          newStatus = 'completed';
          notificationTitle = 'Teklif Tamamlandı';
          notificationMessage = 'Teklifiniz admin tarafından tamamlandı olarak işaretlendi';
          break;
        case 'cancel':
          newStatus = 'cancelled';
          notificationTitle = 'Teklif İptal Edildi';
          notificationMessage = 'Teklifiniz admin tarafından iptal edildi';
          break;
        default:
          throw new Error('Geçersiz işlem');
      }

      // Eğer kabul işlemi ise, her ilan için diğer bekleyen teklifleri reddet
      if (action === 'accept') {
        const listingIds = [...new Set(targetOffers.map(offer => offer.listingId))];
        
        for (const listingId of listingIds) {
          const acceptedOfferIds = targetOffers
            .filter(offer => offer.listingId === listingId)
            .map(offer => offer.id);
          
          // Bu ilan için diğer bekleyen teklifleri reddet
          await prisma.offer.updateMany({
            where: {
              listingId: listingId,
              status: 'pending',
              id: { notIn: acceptedOfferIds }
            },
            data: { status: 'rejected' }
          });
        }
      }

      // Toplu güncelleme
      const updateResult = await prisma.offer.updateMany({
        where: {
          id: { in: offerIds }
        },
        data: {
          status: newStatus
        }
      });
      
      updatedCount = updateResult.count;

      // Bildirimler ve log kayıtları oluştur
      for (const offer of targetOffers) {
        // Bildirim oluştur
        await prisma.notification.create({
          data: {
            userId: offer.userId,
            title: notificationTitle,
            message: `${notificationMessage}: ${offer.listing.title}`,
            type: 'offer_update',
            relatedId: offer.id
          }
        });

        // Log kaydı oluştur
        await prisma.adminLog.create({
          data: {
            adminId: userId,
            action: `offer_bulk_${action}`,
            targetType: 'offer',
            targetId: offer.id,
            details: {
              offerUser: offer.user.name,
              listingTitle: offer.listing.title,
              previousStatus: offer.status,
              newStatus: newStatus,
              bulkOperation: true
            }
          }
        });

        results.push({
          offerId: offer.id,
          previousStatus: offer.status,
          newStatus: newStatus,
          success: true
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: action === 'delete' 
        ? `${deletedCount} teklif silindi`
        : `${updatedCount} teklif güncellendi`,
      results: action === 'delete' ? { deletedCount } : { updatedCount, results }
    });
  } catch (error) {
    console.error('Admin offers bulk operation error:', error);
    return NextResponse.json(
      { error: 'Toplu işlem gerçekleştirilemedi' },
      { status: 500 }
    );
  }
}