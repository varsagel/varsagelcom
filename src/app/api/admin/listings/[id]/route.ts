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
    const { id } = await params;
    const listingId = id;

    // Hedef ilanın var olup olmadığını kontrol et
    const targetListing = await prisma.listing.findUnique({
      where: { id: listingId }
    });

    if (!targetListing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    let updatedListing;

    switch (action) {
      case 'approve':
        updatedListing = await prisma.listing.update({
          where: { id: listingId },
          data: { 
            status: 'active',
            // İlan onaylandığında süresini 30 gün uzat
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        });
        break;

      case 'reject':
        updatedListing = await prisma.listing.update({
          where: { id: listingId },
          data: { status: 'rejected' }
        });
        break;

      case 'feature':
        updatedListing = await prisma.listing.update({
          where: { id: listingId },
          data: { 
            isFeatured: true,
            // Öne çıkan ilanların süresi 7 gün uzatılır
            featuredUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        });
        break;

      case 'unfeature':
        updatedListing = await prisma.listing.update({
          where: { id: listingId },
          data: { 
            isFeatured: false,
            featuredUntil: null
          }
        });
        break;

      case 'activate':
        updatedListing = await prisma.listing.update({
          where: { id: listingId },
          data: { 
            status: 'active',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        });
        break;

      case 'deactivate':
        updatedListing = await prisma.listing.update({
          where: { id: listingId },
          data: { status: 'expired' }
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Geçersiz işlem' },
          { status: 400 }
        );
    }

    // İlan sahibine bildirim gönder
    const actionMessages = {
      approve: 'İlanınız onaylandı ve yayınlandı',
      reject: 'İlanınız reddedildi',
      feature: 'İlanınız öne çıkarıldı',
      unfeature: 'İlanınızın öne çıkarma süresi sona erdi',
      activate: 'İlanınız tekrar aktif hale getirildi',
      deactivate: 'İlanınız devre dışı bırakıldı'
    };

    await prisma.notification.create({
      data: {
        userId: targetListing.userId,
        title: 'İlan Durumu Güncellendi',
        message: actionMessages[action as keyof typeof actionMessages],
        type: 'listing_update',
        relatedId: listingId
      }
    });

    return NextResponse.json({
      success: true,
      message: `İlan başarıyla ${action === 'approve' ? 'onaylandı' : action === 'reject' ? 'reddedildi' : action === 'feature' ? 'öne çıkarıldı' : 'güncellendi'}`,
      listing: updatedListing
    });
  } catch (error) {
    console.error('Admin listing action error:', error);
    return NextResponse.json(
      { error: 'İlan işlemi sırasında hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const listingId = id;

    // Hedef ilanın var olup olmadığını kontrol et
    const targetListing = await prisma.listing.findUnique({
      where: { id: listingId }
    });

    if (!targetListing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    // İlanı ve ilişkili verileri sil (CASCADE)
    await prisma.$transaction(async (tx) => {
      // Önce bağımlı kayıtları sil
      await tx.listingView.deleteMany({
        where: { listingId }
      });
      
      await tx.favorite.deleteMany({
        where: { listingId }
      });
      
      await tx.review.deleteMany({
        where: { listingId }
      });
      
      await tx.answer.deleteMany({
        where: {
          question: {
            listingId
          }
        }
      });
      
      await tx.question.deleteMany({
        where: { listingId }
      });
      
      await tx.message.deleteMany({
        where: {
          conversation: {
            listingId
          }
        }
      });
      
      await tx.conversation.deleteMany({
        where: { listingId }
      });
      
      await tx.notification.deleteMany({
        where: { relatedId: listingId }
      });
      
      await tx.offer.deleteMany({
        where: { listingId }
      });
      
      // Son olarak ilanı sil
      await tx.listing.delete({
        where: { id: listingId }
      });
    });

    // İlan sahibine bildirim gönder
    await prisma.notification.create({
      data: {
        userId: targetListing.userId,
        title: 'İlan Silindi',
        message: 'İlanınız yönetici tarafından silindi',
        type: 'listing_deleted'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'İlan ve tüm verileri başarıyla silindi'
    });
  } catch (error) {
    console.error('Admin listing delete error:', error);
    return NextResponse.json(
      { error: 'İlan silinirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const listingId = id;

    // İlan detaylarını getir
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            offers: true,
            favorites: true,
            views: true,
            questions: true
          }
        },
        offers: {
          select: {
            id: true,
            price: true,
            status: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        questions: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            asker: {
              select: {
                name: true,
                email: true
              }
            },
            answer: {
              select: {
                id: true,
                content: true,
                createdAt: true
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

    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      listing
    });
  } catch (error) {
    console.error('Admin listing detail error:', error);
    return NextResponse.json(
      { error: 'İlan detayları alınırken hata oluştu' },
      { status: 500 }
    );
  }
}