import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Belirli bir teklifin detaylarını getir
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserIdFromToken(request.headers);
    const { id } = await params;
    
    console.log('Teklif detayı isteniyor - ID:', id, 'User ID:', userId);
    
    // Teklifi getir - sadece ilgili kullanıcılar görebilir
    const offer = await prisma.offer.findFirst({
      where: {
        id,
        OR: [
          { userId: userId }, // Teklifi gönderen
          { listing: { userId: userId } }, // İlan sahibi
        ],
      },
      select: {
        id: true,
        price: true,
        duration: true,
        message: true,
        experience: true,
        portfolio: true,
        guaranteeOffered: true,
        revisionCount: true,
        additionalServices: true,
        status: true,
        createdAt: true,
        categorySpecificData: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            subcategory: true,
            location: true,
            district: true,
            budgetMin: true,
            budgetMax: true,
            price: true,
            images: true,
            videoUrl: true,
            expiresAt: true,
            status: true,
            createdAt: true,
            viewCount: true,
            likeCount: true,
            favoriteCount: true,
            categorySpecificData: true,
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });
    
    console.log('Teklif sorgusu sonucu:', offer ? 'Bulundu' : 'Bulunamadı');
    
    if (!offer) {
      console.log('Teklif bulunamadı - ID:', id, 'User ID:', userId);
      return NextResponse.json(
        { error: 'Teklif bulunamadı' },
        { status: 404 }
      );
    }
    
    console.log('Teklif başarıyla döndürülüyor:', offer.id);
    return NextResponse.json(offer);
  } catch (error) {
    console.error('Teklif getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Teklif getirilemedi' },
      { status: 500 }
    );
  }
}

// Teklifi güncelle (kabul et veya reddet)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return await updateOffer(request, { params });
}

// PATCH metodu da aynı işlevi görür
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return await updateOffer(request, { params });
}

async function updateOffer(request: NextRequest, params: { params: Promise<{ id: string }> }) {
  try {
    console.log('UpdateOffer başladı - Headers:', Object.fromEntries(request.headers.entries()));
    
    const userId = await getUserIdFromToken(request.headers);
    console.log('UpdateOffer - userId alındı:', userId);
    
    const { id } = await params.params;
    console.log('UpdateOffer - offerId:', id);
    
    const body = await request.json();
    const { action } = body;
    
    console.log('UpdateOffer - userId:', userId, 'offerId:', id, 'action:', action, 'body:', body);
    
    if (!['accept', 'reject', 'cancel'].includes(action)) {
      console.log('Invalid action received:', action);
      return NextResponse.json(
        { error: 'Geçersiz işlem' },
        { status: 400 }
      );
    }

    // Teklifi getir - cancel için teklif sahibi de işlem yapabilir
    const offer = await prisma.offer.findFirst({
      where: {
        id,
        OR: [
          { listing: { userId: userId } }, // İlan sahibi (accept/reject için)
          { userId: userId } // Teklif sahibi (cancel için)
        ]
      },
      include: {
        listing: true,
      },
    });
    
    console.log('Found offer:', !!offer, 'offer status:', offer?.status);
    
    if (!offer) {
      console.log('Offer not found or no permission for userId:', userId, 'offerId:', id);
      return NextResponse.json(
        { error: 'Teklif bulunamadı veya yetkiniz yok' },
        { status: 404 }
      );
    }

    // Yetki kontrolü
    if (action === 'cancel') {
      // Cancel işlemi için teklif sahibi olmalı
      if (offer.userId !== userId) {
        return NextResponse.json(
          { error: 'Bu teklifi iptal etme yetkiniz yok' },
          { status: 403 }
        );
      }
      // Cancel için teklif pending veya accepted durumunda olmalı
      if (!['pending', 'accepted'].includes(offer.status)) {
        return NextResponse.json(
          { error: 'Bu teklif iptal edilemez' },
          { status: 400 }
        );
      }
    } else {
      // Accept/reject işlemleri için ilan sahibi olmalı
      if (offer.listing.userId !== userId) {
        return NextResponse.json(
          { error: 'Bu teklifi kabul/reddetme yetkiniz yok' },
          { status: 403 }
        );
      }
      // Accept/reject için teklif pending durumunda olmalı
      if (offer.status !== 'pending') {
        console.log('Offer not pending, current status:', offer.status);
        return NextResponse.json(
          { error: 'Bu teklif zaten işleme alınmış' },
          { status: 400 }
        );
      }
    }
    
    // Teklifi güncelle
    let newStatus;
    if (action === 'accept') {
      newStatus = 'accepted';
    } else if (action === 'reject') {
      newStatus = 'rejected';
    } else if (action === 'cancel') {
      newStatus = 'cancelled';
    }
    
    console.log('Teklif güncelleniyor:', { offerId: offer.id, action, newStatus });
    
    const updatedOffer = await prisma.offer.update({
      where: { id: offer.id },
      data: { status: newStatus },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        listing: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });
    
    console.log('Teklif başarıyla güncellendi:', updatedOffer.id, 'Yeni durum:', updatedOffer.status);

      // Bildirim gönder
      if (action === 'cancel') {
        // Teklif iptal edildiğinde ilan sahibine bildirim gönder
        await prisma.notification.create({
          data: {
            userId: updatedOffer.listing.userId,
            type: 'offer_cancelled',
            message: `"${updatedOffer.listing.title}" ilanınız için ${updatedOffer.user.name} tarafından verilen ${updatedOffer.price} TL tutarındaki teklif iptal edildi.`,
            metadata: {
              listingId: updatedOffer.listingId,
              offerId: updatedOffer.id,
              offerPrice: updatedOffer.price,
              action: action
            }
          }
        });
      } else {
        // Teklif sahibine bildirim gönder
        await prisma.notification.create({
          data: {
            userId: updatedOffer.userId,
            type: action === 'accept' ? 'offer_accepted' : 'offer_rejected',
            message: action === 'accept' 
              ? `"${updatedOffer.listing.title}" ilanı için verdiğiniz ${updatedOffer.price} TL tutarındaki teklif kabul edildi.`
              : `"${updatedOffer.listing.title}" ilanı için verdiğiniz ${updatedOffer.price} TL tutarındaki teklif reddedildi.`,
            metadata: {
              listingId: updatedOffer.listingId,
              offerId: updatedOffer.id,
              offerPrice: updatedOffer.price,
              action: action
            }
          }
        });
      }
    
    // Eğer teklif kabul edildiyse
    if (action === 'accept') {
      // İlanı "assigned" durumuna getir
      await prisma.listing.update({
        where: { id: offer.listingId },
        data: { status: 'assigned' },
      });
      
      // Diğer bekleyen teklifleri reddet
      await prisma.offer.updateMany({
        where: {
          listingId: offer.listingId,
          id: { not: id },
          status: 'pending',
        },
        data: { status: 'rejected' },
      });
      
      // Konuşma oluştur (eğer yoksa)
      try {
        const existingConversation = await prisma.conversation.findUnique({
          where: { offerId: id }
        });
        
        if (!existingConversation) {
          const conversation = await prisma.conversation.create({
            data: {
              offerId: id
            }
          });
          console.log('Konuşma oluşturuldu:', conversation.id);
        } else {
          console.log('Konuşma zaten mevcut:', existingConversation.id);
        }
      } catch (conversationError) {
        console.error('Konuşma oluşturulurken hata:', conversationError);
        // Konuşma oluşturma hatası teklif kabulünü engellemez
      }
    }
    
    // Eğer teklif iptal edildiyse ve önceden kabul edilmişse
    if (action === 'cancel' && offer.status === 'accepted') {
      // İlanı tekrar aktif duruma getir
      await prisma.listing.update({
        where: { id: offer.listingId },
        data: { 
          status: 'active',
          updatedAt: new Date()
        },
      });
      console.log('İlan tekrar aktif hale getirildi:', offer.listingId);
    }
    
    let successMessage;
    if (action === 'accept') {
      successMessage = 'Teklif başarıyla kabul edildi';
    } else if (action === 'reject') {
      successMessage = 'Teklif başarıyla reddedildi';
    } else if (action === 'cancel') {
      successMessage = 'Teklif başarıyla iptal edildi';
    }
    console.log('İşlem tamamlandı:', successMessage);
    
    return NextResponse.json({
      success: true,
      message: successMessage,
      offer: updatedOffer,
      action: action
    }, { status: 200 });
  } catch (error) {
    console.error('Teklif işlemi sırasında hata:', error);
    console.error('Hata detayları:', {
      message: error instanceof Error ? error.message : 'Bilinmeyen hata',
      stack: error instanceof Error ? error.stack : 'Stack yok',
      name: error instanceof Error ? error.name : 'İsim yok'
    });
    return NextResponse.json(
      { error: 'Teklif işlemi başarısız: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata') },
      { status: 500 }
    );
  }
}

// Teklifi sil
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserIdFromToken(request.headers);
    const { id } = await params;
    
    // Teklifi getir
    const offer = await prisma.offer.findUnique({
      where: { id },
    });
    
    if (!offer) {
      return NextResponse.json(
        { error: 'Teklif bulunamadı' },
        { status: 404 }
      );
    }
    
    // Kullanıcının teklif sahibi olup olmadığını kontrol et
    if (offer.userId !== userId) {
      return NextResponse.json(
        { error: 'Bu teklifi silme yetkiniz yok' },
        { status: 403 }
      );
    }

    // Sadece beklemedeki ve reddedilmiş teklifler silinebilir
    if (offer.status !== 'pending' && offer.status !== 'rejected') {
      return NextResponse.json(
        { error: 'Sadece beklemedeki ve reddedilmiş teklifler silinebilir' },
        { status: 400 }
      );
    }
    
    // Teklifi sil
    await prisma.offer.delete({
      where: { id },
    });
    
    return NextResponse.json({
      message: 'Teklif başarıyla silindi',
    });
  } catch (error) {
    console.error('Teklif silinirken hata:', error);
    return NextResponse.json(
      { error: 'Teklif silinemedi' },
      { status: 500 }
    );
  }
}