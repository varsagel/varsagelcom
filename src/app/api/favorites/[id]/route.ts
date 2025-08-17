import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserId } from '@/lib/auth';

const prisma = new PrismaClient();

// Favoriyi sil
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = getUserId(request.headers);
    
    // Favoriyi getir
    const favorite = await prisma.favorite.findUnique({
      where: { id },
      include: {
        listing: true,
      },
    });
    
    if (!favorite) {
      return NextResponse.json(
        { error: 'Favorite not found' },
        { status: 404 }
      );
    }
    
    // Kullanıcının favori sahibi olup olmadığını kontrol et
    if (favorite.userId !== userId) {
      return NextResponse.json(
        { error: 'You are not authorized to delete this favorite' },
        { status: 403 }
      );
    }
    
    // Favoriyi sil
    await prisma.favorite.delete({
      where: { id },
    });
    
    // İlanın favori sayısını güncelle
    await prisma.listing.update({
      where: { id: favorite.listingId },
      data: {
        favoriteCount: { decrement: 1 },
      },
    });
    
    return NextResponse.json({
      message: 'Removed from favorites successfully',
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json(
      { error: 'An error occurred while removing from favorites' },
      { status: 500 }
    );
  }
}