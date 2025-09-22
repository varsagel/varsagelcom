import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCategoryById, getSubCategoryById } from '@/data/categories';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const { id } = await params;
    const offer = await prisma.offer.findUnique({
      where: {
        id: id,
        OR: [
          { sellerId: user.id }, // Teklifi veren kişi
          { listing: { userId: user.id } } // İlan sahibi
        ]
      },
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        listing: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            _count: {
              select: {
                offers: true,
                favorites: true
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

    // Get category and subcategory names
    const category = getCategoryById(offer.listing.categoryId);
    const subcategory = getSubCategoryById(offer.listing.categoryId, offer.listing.subCategoryId);

    // Format the response to match the frontend interface
    const formattedOffer = {
      id: offer.id,
      amount: offer.amount,
      message: offer.description,
      status: offer.status,
      rejectionReason: (offer as any).rejectionReason,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
      categorySpecificData: (() => {
        if (!offer.categorySpecificData) return {};
        try {
          // Eğer zaten bir object ise, direkt döndür
          if (typeof offer.categorySpecificData === 'object') {
            return offer.categorySpecificData;
          }
          // String ise parse et
          return JSON.parse(offer.categorySpecificData);
        } catch (error) {
          console.error('categorySpecificData parse error:', error);
          return {};
        }
      })(),
      listing: {
        id: offer.listing.id,
        title: offer.listing.title,
        description: offer.listing.description,
        minPrice: offer.listing.minPrice,
        maxPrice: offer.listing.maxPrice,
        images: offer.listing.images,
        location: offer.listing.location,
        status: offer.listing.status,
        category: category?.name || 'Bilinmeyen Kategori',
        subcategory: subcategory?.name || 'Bilinmeyen Alt Kategori',
        createdAt: offer.listing.createdAt,
        views: offer.listing.views,
        user: {
          id: offer.listing.user.id,
          name: `${offer.listing.user.firstName} ${offer.listing.user.lastName}`,
          email: offer.listing.user.email
        },
        _count: offer.listing._count
      }
    };

    return NextResponse.json(formattedOffer);
  } catch (error) {
    console.error('Teklif detayı getirme hatası:', error);
    return NextResponse.json(
      { error: 'Teklif detayı getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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
    const { status, rejectionReason } = body;

    if (!status || !['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Geçersiz durum. Sadece "accepted" veya "rejected" değerleri kabul edilir.' },
        { status: 400 }
      );
    }

    // Reddetme durumunda reddetme nedeni zorunlu
    if (status === 'rejected' && (!rejectionReason || rejectionReason.trim() === '')) {
      return NextResponse.json(
        { error: 'Teklifi reddetmek için bir neden belirtmeniz gerekiyor.' },
        { status: 400 }
      );
    }

    // Teklifi bul
    const offer = await prisma.offer.findUnique({
      where: { id: id },
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

    if (!offer) {
      return NextResponse.json(
        { error: 'Teklif bulunamadı' },
        { status: 404 }
      );
    }

    // Sadece ilan sahibi teklifi kabul/red edebilir
    if (offer.listing.userId !== user.id) {
      return NextResponse.json(
        { error: 'Bu teklifi güncelleme yetkiniz yok' },
        { status: 403 }
      );
    }

    // Teklifi güncelle
    const updateData: any = { status };
    if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason;
    }

    const updatedOffer = await prisma.offer.update({
      where: { id: id },
      data: updateData,
      include: {
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
          include: {
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

    // Teklif veren kişiye bildirim oluştur
    const notificationMessage = status === 'accepted' 
      ? `"${offer.listing.title}" ilanı için teklifiniz kabul edildi`
      : `"${offer.listing.title}" ilanı için teklifiniz reddedildi`;

    await prisma.notification.create({
      data: {
        userId: offer.sellerId,
        type: status === 'accepted' ? 'offer_accepted' : 'offer_rejected',
        title: status === 'accepted' ? 'Teklif Kabul Edildi' : 'Teklif Reddedildi',
        message: notificationMessage,
        relatedId: offer.id,
        isRead: false
      }
    });

    // Eğer teklif kabul edildiyse, ilanı "sold" durumuna getir
    if (status === 'accepted') {
      await prisma.listing.update({
        where: { id: offer.listingId },
        data: { status: 'sold' }
      });

      // Diğer bekleyen teklifleri reddet
      await prisma.offer.updateMany({
        where: {
          listingId: offer.listingId,
          id: { not: id },
          status: 'pending'
        },
        data: {
          status: 'rejected'
        }
      });
    }

    return NextResponse.json(updatedOffer);
  } catch (error) {
    console.error('Teklif güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Teklif güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

    // Teklifi bul
    const offer = await prisma.offer.findUnique({
      where: { id: id }
    });

    if (!offer) {
      return NextResponse.json(
        { error: 'Teklif bulunamadı' },
        { status: 404 }
      );
    }

    // Sadece teklif veren kişi kendi teklifini silebilir
    if (offer.sellerId !== user.id) {
      return NextResponse.json(
        { error: 'Bu teklifi silme yetkiniz yok' },
        { status: 403 }
      );
    }

    // Sadece bekleyen teklifler silinebilir
    if (offer.status !== 'pending') {
      return NextResponse.json(
        { error: 'Sadece bekleyen teklifler silinebilir' },
        { status: 400 }
      );
    }

    await prisma.offer.delete({
      where: { id: id }
    });

    return NextResponse.json({ message: 'Teklif başarıyla silindi' });
  } catch (error) {
    console.error('Teklif silme hatası:', error);
    return NextResponse.json(
      { error: 'Teklif silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}