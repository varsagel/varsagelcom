import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';
import { checkBannedWords } from '@/lib/banned-words';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  let userId: string | null = null;
  let type: string = 'sent';
  
  try {
    userId = await getUserIdFromToken(request.headers);

    const { searchParams } = new URL(request.url);
    type = searchParams.get('type') || 'sent';
    const displayNumber = searchParams.get('displayNumber');

    let offers;
    
    if (type === 'sent') {
      // Kullanıcının gönderdiği teklifler
      const whereCondition: any = {
        userId: userId,
      };
      
      if (displayNumber) {
        whereCondition.displayNumber = displayNumber;
      }
      
      offers = await prisma.offer.findMany({
        where: whereCondition,
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              description: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          conversation: {
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      // Kullanıcının aldığı teklifler
      const whereCondition: any = {
        listing: {
          userId: userId,
        },
      };
      
      if (displayNumber) {
        whereCondition.displayNumber = displayNumber;
      }
      
      offers = await prisma.offer.findMany({
        where: whereCondition,
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              description: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          conversation: {
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    // Veriyi formatla
    const formattedOffers = offers.map(offer => ({
      id: offer.id,
      price: offer.price,
      deliveryTime: offer.duration,
      description: offer.message,
      experience: offer.experience,
      portfolio: offer.portfolio,
      guaranteeOffered: offer.guaranteeOffered,
      revisionCount: offer.revisionCount,
      additionalServices: offer.additionalServices,
      status: offer.status,
      createdAt: offer.createdAt,
      conversationId: offer.conversation?.id || null,
      listing: offer.listing,
      user: offer.user,
    }));

    return NextResponse.json(formattedOffers);
  } catch (error) {
    console.error('Teklifler getirilirken hata:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      type
    });
    return NextResponse.json(
      { error: `Teklifler getirilemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}` },
      { status: 500 }
    );
  }
}

// Teklif oluştur
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Yetkilendirme tokeni gerekli' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      console.error('JWT_SECRET is not configured');
      return NextResponse.json(
        { error: 'Sunucu yapılandırma hatası' },
        { status: 500 }
      );
    }

    let userId: string;
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(jwtSecret));
      userId = (payload as { userId: string }).userId;
    } catch (error) {
      return NextResponse.json(
        { error: 'Geçersiz token' },
        { status: 401 }
      );
    }
    
    // Request body'den verileri al
    const body = await request.json();
    const { 
      listingId, 
      price, 
      deliveryTime, 
      description,
      experience,
      portfolio,
      guaranteeOffered,
      revisionCount,
      additionalServices,
      categorySpecificData
    } = body;
    
    // Zorunlu alanları kontrol et
    if (!listingId || !price || !description || !deliveryTime || !experience) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      );
    }
    
    // Yasaklı kelime kontrolü - açıklama
    const descriptionCheck = checkBannedWords(description);
    if (descriptionCheck.hasBannedWords) {
      return NextResponse.json({
        error: 'Teklif açıklamasında uygunsuz içerik bulunmaktadır. Lütfen açıklamanızı düzenleyerek tekrar deneyin.',
        bannedWords: descriptionCheck.bannedWords
      }, { status: 400 });
    }
    
    // Yasaklı kelime kontrolü - deneyim
    const experienceCheck = checkBannedWords(experience);
    if (experienceCheck.hasBannedWords) {
      return NextResponse.json({
        error: 'Deneyim açıklamasında uygunsuz içerik bulunmaktadır. Lütfen deneyim açıklamanızı düzenleyerek tekrar deneyin.',
        bannedWords: experienceCheck.bannedWords
      }, { status: 400 });
    }
    
    // Yasaklı kelime kontrolü - portfolyo
    if (portfolio) {
      const portfolioCheck = checkBannedWords(portfolio);
      if (portfolioCheck.hasBannedWords) {
        return NextResponse.json({
          error: 'Portfolyo açıklamasında uygunsuz içerik bulunmaktadır. Lütfen portfolyo açıklamanızı düzenleyerek tekrar deneyin.',
          bannedWords: portfolioCheck.bannedWords
        }, { status: 400 });
      }
    }

    // Kategori bazlı zorunlu alanları kontrol et
    if (categorySpecificData) {
      // Otomobil kategorisi için özel validasyonlar
      if (categorySpecificData.vehicleCondition !== undefined) {
        if (!categorySpecificData.vehicleCondition) {
          return NextResponse.json(
            { error: 'Araç durumu seçilmelidir' },
            { status: 400 }
          );
        }
        if (!categorySpecificData.mileage || isNaN(Number(categorySpecificData.mileage)) || Number(categorySpecificData.mileage) < 0) {
          return NextResponse.json(
            { error: 'Geçerli bir kilometre değeri giriniz' },
            { status: 400 }
          );
        }
        if (!categorySpecificData.modelYear || isNaN(Number(categorySpecificData.modelYear)) || 
            Number(categorySpecificData.modelYear) < 1950 || 
            Number(categorySpecificData.modelYear) > new Date().getFullYear() + 1) {
          return NextResponse.json(
            { error: 'Geçerli bir model yılı giriniz' },
            { status: 400 }
          );
        }
      }
    }

    // Validate price
    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        { error: 'Geçerli bir teklif miktarı giriniz' },
        { status: 400 }
      );
    }
    
    // İlanın varlığını kontrol et
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
    
    // Kullanıcının kendi ilanına teklif vermesini engelle
    if (listing.userId === userId) {
      return NextResponse.json(
        { error: 'Kendi ilanınıza teklif veremezsiniz' },
        { status: 400 }
      );
    }

    // Check if user already made an accepted offer for this listing
    const existingAcceptedOffer = await prisma.offer.findFirst({
      where: {
        listingId,
        userId,
        status: 'accepted'
      }
    });

    if (existingAcceptedOffer) {
      return NextResponse.json(
        { error: 'Bu ilana kabul edilmiş teklifiniz bulunmaktadır. Tekrar teklif veremezsiniz.' },
        { status: 400 }
      );
    }

    // Check if user has a pending offer for this listing
    const existingPendingOffer = await prisma.offer.findFirst({
      where: {
        listingId,
        userId,
        status: 'pending'
      }
    });

    if (existingPendingOffer) {
      return NextResponse.json(
        { error: 'Bu ilana beklemede olan teklifiniz bulunmaktadır. Önce mevcut teklifinizi iptal edin.' },
        { status: 400 }
      );
    }

    // Check if user has been rejected twice and is within 1-hour cooldown period
    const rejectedOffers = await prisma.offer.findMany({
      where: {
        listingId,
        userId,
        status: 'rejected'
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    if (rejectedOffers.length >= 2) {
      const lastRejectedOffer = rejectedOffers[0];
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      
      if (lastRejectedOffer.updatedAt > oneHourAgo) {
        const remainingTime = Math.ceil((lastRejectedOffer.updatedAt.getTime() + 60 * 60 * 1000 - Date.now()) / (1000 * 60));
        return NextResponse.json(
          { error: `Bu ilana 2 kez reddedildiniz. ${remainingTime} dakika sonra tekrar teklif verebilirsiniz.` },
          { status: 400 }
        );
      }
    }
    
    // Benzersiz displayNumber oluştur
    const displayNumber = `TKF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Teklifi oluştur
    const offer = await prisma.offer.create({
      data: {
        displayNumber,
        price: price,
        duration: deliveryTime,
        message: description,
        userId: userId,
        listingId,
        experience: experience || '',
        portfolio: portfolio || '',
        guaranteeOffered: guaranteeOffered || false,
        revisionCount: revisionCount || 0,
        additionalServices: additionalServices || [],
        categorySpecificData: categorySpecificData || {},
        status: 'pending'
      },
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
            title: true,
            userId: true
          }
        }
      }
    });

    // İlan sahibine bildirim gönder
    try {
      await prisma.notification.create({
        data: {
          userId: listing.userId,
          type: 'new_offer',
          message: `"${listing.title}" ilanınız için ${offer.user.name} tarafından ${price} ₺ teklif verildi.`,
          metadata: {
            offerId: offer.id,
            listingId: listing.id,
            offerPrice: price,
            offerUserId: userId,
            offerUserName: offer.user.name
          }
        }
      });
      
      console.log(`Bildirim gönderildi: İlan sahibi ${listing.userId} için yeni teklif bildirimi`);
    } catch (notificationError) {
      console.error('Bildirim gönderilirken hata:', notificationError);
      // Bildirim hatası teklif oluşturmayı engellemez
    }
    
    return NextResponse.json({
      success: true,
      message: 'Teklif başarıyla gönderildi ve ilan sahibine bildirim gönderildi',
      offer
    });
  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}