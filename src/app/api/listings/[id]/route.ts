import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();

// Belirli bir ilanın detaylarını getir
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Get user ID from token if available
    let userId: string | null = null;
    const authHeader = request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ') && process.env.JWT_SECRET) {
      try {
        const token = authHeader.substring(7);
        const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
        userId = (payload as { userId: string }).userId;
      } catch (error) {
        // Token geçersiz ama listing'i yine de gösterebiliriz
        console.log('Invalid token, continuing without user context');
      }
    }
    
    // İlanı getir
    const listing = await prisma.listing.findUnique({
      where: { id },
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
        // Remove mileageMin since it's not a valid property in ListingSelect type
        // Removed mileageMax since it's not a valid property in ListingSelect type
        images: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        viewCount: true,
        categorySpecificData: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            rating: true,
            reviewCount: true,
            location: true,
          },
        },
        offers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true,
                rating: true,
                reviewCount: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            offers: true,
            favorites: true,
          },
        },
      },
    });
    
    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    // Check if user has already viewed this listing
    let shouldIncrementView = true;
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    if (userId) {
      const existingView = await prisma.listingView.findUnique({
        where: {
          userId_listingId: {
            userId,
            listingId: id
          }
        }
      });
      
      if (!existingView) {
        // Create new view record for logged-in user
        await prisma.listingView.create({
          data: {
            userId,
            listingId: id,
            ipAddress: clientIP
          }
        });
      } else {
        shouldIncrementView = false;
      }
    } else {
      // For anonymous users, check IP-based tracking
      const existingIPView = await prisma.listingView.findFirst({
        where: {
          listingId: id,
          ipAddress: clientIP,
          userId: null
        }
      });
      
      if (!existingIPView) {
        // Create new view record for anonymous user with IP
        await prisma.listingView.create({
          data: {
            listingId: id,
            ipAddress: clientIP
          }
        });
      } else {
        shouldIncrementView = false;
      }
    }
    
    // Increment view count only if this is a new view
    if (shouldIncrementView) {
      await prisma.listing.update({
        where: { id },
        data: {
          viewCount: {
            increment: 1
          }
        }
      });
    }

    // Check if user has favorited this listing
    let isFavorite = false;
    if (userId) {
      const favorite = await prisma.favorite.findFirst({
        where: {
          userId,
          listingId: id
        }
      });
      isFavorite = !!favorite;
    }

    // Parse categorySpecificData if it exists
    let categoryData = {};
    if (listing.categorySpecificData) {
      try {
        categoryData = typeof listing.categorySpecificData === 'string' 
          ? JSON.parse(listing.categorySpecificData) 
          : listing.categorySpecificData as Record<string, unknown>;
      } catch (error) {
        console.error('Error parsing categorySpecificData:', error);
      }
    }

    const formattedListing = {
      ...listing,
      images: listing.images ? JSON.parse(listing.images) : [],
      budget: {
        min: listing.budgetMin || 0,
        max: listing.budgetMax || 0
      },
      user: {
        ...(listing.user || {}),
        image: listing.user.profileImage,
        email: listing.user.email || 'Email gizli',
        location: listing.user.location || 'Konum belirtilmemiş',
        completedJobs: listing.user.reviewCount || 0,
        responseTime: '< 1h',
        verificationStatus: 'verified',
        joinedDate: listing.createdAt
      },
      offerCount: listing._count.offers,
      favoriteCount: listing?._count?.favorites ?? 0,
      viewCount: listing.viewCount + 1, // +1 because we just incremented it
      priority: 'normal',
      skills: [],
      deliveryTime: 7,
      revisions: 3,
      tags: [],
      isFavorite,
      // Category specific data
      brand: (categoryData as any).brand || null,
      model: (categoryData as any).model || null,
      series: (categoryData as any).series || null,
      vehicleYear: (categoryData as any).vehicleYear || (categoryData as any).modelYear || null,
      vehicleYearMin: (categoryData as any).vehicleYearMin || null,
      vehicleYearMax: (categoryData as any).vehicleYearMax || null,
      propertyType: (categoryData as any).propertyType || null,
      area: (categoryData as any).area || null,
      rooms: (categoryData as any).rooms || null,
      fuelType: (categoryData as any).fuelType || null,
      transmission: (categoryData as any).transmission || null,
      bodyType: (categoryData as any).bodyType || null,
      color: (categoryData as any).color || null,
      mileage: (categoryData as any).mileage || null,
      condition: (categoryData as any).condition || (categoryData as any).vehicleCondition || null,
      warranty: (categoryData as any).warranty || null,
      serviceType: (categoryData as any).serviceType || null,
      experience: (categoryData as any).experience || null,
      urgency: (categoryData as any).urgency || null,
      mileageMin: (categoryData as any).mileageMin || null,
      mileageMax: (categoryData as any).mileageMax || null
    };
    
    return NextResponse.json({ 
      success: true,
      listing: formattedListing 
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the listing' },
      { status: 500 }
    );
  }
}

// İlanı güncelle
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // İlanın varlığını kontrol et
    const existingListing = await prisma.listing.findUnique({
      where: { id },
    });
    
    if (!existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // İlanı güncelle
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: body,
    });
    
    return NextResponse.json({
      message: 'Listing updated successfully',
      listing: updatedListing,
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the listing' },
      { status: 500 }
    );
  }
}

// İlanı sil
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // İlanın varlığını kontrol et
    const existingListing = await prisma.listing.findUnique({
      where: { id },
    });
    
    if (!existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // İlanı sil
    await prisma.listing.delete({
      where: { id },
    });
    
    return NextResponse.json({
      message: 'Listing deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the listing' },
      { status: 500 }
    );
  }
}