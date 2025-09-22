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

    // Kullanıcının kabul edilen tekliflerini getir (hem verdiği hem aldığı)
    const [sentAcceptedOffers, receivedAcceptedOffers] = await Promise.all([
      // Kullanıcının verdiği ve kabul edilen teklifler
      prisma.offer.findMany({
        where: {
          sellerId: user.id,
          status: 'accepted'
        },
        select: {
          id: true,
          amount: true,
          description: true,
          status: true,
          createdAt: true,

          listing: {
            select: {
              id: true,
              title: true,
              minPrice: true,
              maxPrice: true,
              images: true,
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
      // Kullanıcının aldığı ve kabul ettiği teklifler
      prisma.offer.findMany({
        where: {
          buyerId: user.id,
          status: 'accepted'
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
              email: true
            }
          },
          listing: {
            select: {
              id: true,
              title: true,
              minPrice: true,
              maxPrice: true,
              images: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);

    // İki listeyi birleştir ve tarihe göre sırala
    const allAcceptedOffers = [
      ...sentAcceptedOffers.map(offer => ({ ...offer, type: 'sent' })),
      ...receivedAcceptedOffers.map(offer => ({ ...offer, type: 'received' }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(allAcceptedOffers);
  } catch (error) {
    console.error('Kabul edilen teklifler getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}