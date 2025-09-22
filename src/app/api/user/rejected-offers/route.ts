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

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Kullanıcının reddedilen tekliflerini getir (hem verdiği hem aldığı)
    const [sentRejectedOffers, receivedRejectedOffers] = await Promise.all([
      // Kullanıcının verdiği ve reddedilen teklifler
      prisma.offer.findMany({
        where: {
          sellerId: user.id,
          status: 'rejected'
        },
        include: {
          listing: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      // Kullanıcının aldığı ve reddettiği teklifler
      prisma.offer.findMany({
        where: {
          buyerId: user.id,
          status: 'rejected'
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
          listing: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);

    // İki listeyi birleştir ve tarihe göre sırala
    const allRejectedOffers = [
      ...sentRejectedOffers.map(offer => ({ ...offer, type: 'sent' })),
      ...receivedRejectedOffers.map(offer => ({ ...offer, type: 'received' }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(allRejectedOffers);
  } catch (error) {
    console.error('Reddedilen teklifler getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}