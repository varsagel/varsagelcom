import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Önce id ile ara, bulamazsa listingNumber ile ara
    let listing = await prisma.listing.findUnique({
      where: {
        id: id
      },
      select: {
        id: true,
        listingNumber: true,
        title: true,
        description: true,
        minPrice: true,
        maxPrice: true,
        location: true,
        categoryId: true,
        subCategoryId: true,
        categorySpecificData: true,
        images: true,
        status: true,
        views: true,
        createdAt: true,
        updatedAt: true,
        expiresAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            createdAt: true
          }
        },
        offers: {
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
                email: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        questions: {
          select: {
            id: true,
            question: true,
            answer: true,
            createdAt: true,
            asker: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            offers: true,
            favorites: true,
            questions: true
          }
        }
      }
    });

    // Eğer id ile bulunamazsa, listingNumber ile ara
    if (!listing) {
      listing = await prisma.listing.findUnique({
        where: {
          listingNumber: id
        },
        select: {
          id: true,
          listingNumber: true,
          title: true,
          description: true,
          minPrice: true,
          maxPrice: true,
          location: true,
          categoryId: true,
          subCategoryId: true,
          categorySpecificData: true,
          images: true,
          status: true,
          views: true,
          createdAt: true,
          updatedAt: true,
          expiresAt: true,
          userId: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
              createdAt: true
            }
          },
          offers: {
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
                  email: true,
                  avatar: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          questions: {
            select: {
              id: true,
              question: true,
              answer: true,
              createdAt: true,
              asker: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          _count: {
            select: {
              offers: true,
              favorites: true,
              questions: true
            }
          }
        }
      });
    }

    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const parsedListing = {
      ...listing,
      images: typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images,
      categorySpecificData: typeof listing.categorySpecificData === 'string' 
        ? JSON.parse(listing.categorySpecificData) 
        : listing.categorySpecificData
    };

    return NextResponse.json(parsedListing);
  } catch (error) {
    console.error('İlan getirme hatası:', error);
    return NextResponse.json(
      { error: 'İlan getirilirken bir hata oluştu' },
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
    const body = await request.json();
    
    // Önce id ile ara, bulamazsa listingNumber ile ara
    let existingListing = await prisma.listing.findUnique({ where: { id: id } });
    
    if (!existingListing) {
      existingListing = await prisma.listing.findUnique({ where: { listingNumber: id } });
    }
    
    if (!existingListing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }
    
    const updatedListing = await prisma.listing.update({
      where: { id: existingListing.id },
      data: body,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        }
      }
    });

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error('İlan güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'İlan güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}