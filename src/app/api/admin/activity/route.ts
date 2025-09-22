import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Son aktiviteleri getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin kontrolü yapılabilir (şimdilik tüm giriş yapmış kullanıcılar admin)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Son aktiviteleri getir
    interface Activity {
      id: string;
      type: string;
      title: string;
      description: string;
      timestamp: string;
      status: string;
    }
    
    const activities: Activity[] = [];

    // Son kullanıcılar
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true
      }
    });

    recentUsers.forEach((user: any) => {
      activities.push({
        id: `user-${user.id}`,
        type: 'user',
        title: 'Yeni kullanıcı kaydı',
        description: `${user.firstName} ${user.lastName} (${user.email}) sisteme katıldı`,
        timestamp: user.createdAt.toISOString(),
        status: 'Aktif'
      });
    });

    // Son ilanlar
    const recentListings = await prisma.listing.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    recentListings.forEach((listing: any) => {
      activities.push({
        id: `listing-${listing.id}`,
        type: 'listing',
        title: 'Yeni ilan oluşturuldu',
        description: `${listing.user.firstName} ${listing.user.lastName} tarafından "${listing.title}" ilanı oluşturuldu`,
        timestamp: listing.createdAt.toISOString(),
        status: listing.status
      });
    });

    // Son teklifler
    const recentOffers = await prisma.offer.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        listing: {
          select: {
            title: true
          }
        }
      }
    });

    recentOffers.forEach((offer: any) => {
      activities.push({
        id: `offer-${offer.id}`,
        type: 'offer',
        title: 'Yeni teklif verildi',
        description: `${offer.buyer.firstName} ${offer.buyer.lastName} tarafından "${offer.listing.title}" ilanına ${offer.price}₺ teklif verildi`,
        timestamp: offer.createdAt.toISOString(),
        status: offer.status
      });
    });

    // Son mesajlar
    const recentMessages = await prisma.message.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        receiver: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    recentMessages.forEach((message: any) => {
      activities.push({
        id: `message-${message.id}`,
        type: 'message',
        title: 'Yeni mesaj gönderildi',
        description: `${message.sender.firstName} ${message.sender.lastName} → ${message.receiver.firstName} ${message.receiver.lastName}`,
        timestamp: message.createdAt.toISOString(),
        status: message.isRead ? 'Okundu' : 'Okunmadı'
      });
    });

    // Aktiviteleri tarihe göre sırala ve en son 20 tanesini al
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    return NextResponse.json(sortedActivities);
  } catch (error) {
    console.error('Admin aktiviteleri getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}