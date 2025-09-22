import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Admin kontrolü
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Tüm ilanları al
    const listings = await prisma.listing.findMany({
      orderBy: { createdAt: 'asc' }
    });

    let updatedCount = 0;

    // Her ilan için geçerli bir listingNumber oluştur
    for (let i = 0; i < listings.length; i++) {
      const listing = listings[i];
      const currentNumber = parseInt(listing.listingNumber);
      
      // Eğer mevcut listingNumber geçerli değilse, yeni bir numara ata
      if (isNaN(currentNumber)) {
        const newListingNumber = (100000 + i).toString();
        
        await prisma.listing.update({
          where: { id: listing.id },
          data: { listingNumber: newListingNumber }
        });
        
        updatedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${updatedCount} ilan numarası güncellendi`,
      updatedCount 
    });

  } catch (error) {
    console.error('Ilan numaraları düzeltme hatası:', error);
    return NextResponse.json(
      { error: 'İlan numaraları düzeltilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}