import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 6 haneli ilan numarası oluştur
async function generateListingNumber(): Promise<string> {
  const lastListing = await prisma.listing.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  
  if (!lastListing) {
    return '100000'; // İlk ilan numarası
  }
  
  // Mevcut listingNumber'ı kontrol et ve geçerli bir sayı olup olmadığını kontrol et
  const currentNumber = parseInt(lastListing.listingNumber);
  
  if (isNaN(currentNumber)) {
    // Eğer mevcut listingNumber geçerli değilse, toplam ilan sayısına göre yeni numara oluştur
    const totalListings = await prisma.listing.count();
    return (100000 + totalListings).toString();
  }
  
  const nextNumber = currentNumber + 1;
  return nextNumber.toString();
}

export async function POST(request: NextRequest) {
  try {
    // NextAuth session kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
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

    const contentType = request.headers.get('content-type');
    
    let title, description, minPrice, maxPrice, city, district, category, subcategory, categorySpecificData, images;
    
    if (contentType?.includes('application/json')) {
      // JSON formatında veri
      const body = await request.json();
      title = body.title;
      description = body.description;
      minPrice = body.minPrice;
      maxPrice = body.maxPrice;
      city = body.city;
      district = body.district;
      category = body.category;
      subcategory = body.subcategory;
      categorySpecificData = body.categorySpecificData || {};
      images = body.images || [];
    } else {
      // FormData formatında veri
      const formData = await request.formData();
      
      title = formData.get('title') as string;
      description = formData.get('description') as string;
      minPrice = parseFloat(formData.get('minPrice') as string);
      maxPrice = parseFloat(formData.get('maxPrice') as string);
      city = formData.get('city') as string;
      district = formData.get('district') as string;
      category = formData.get('category') as string;
      subcategory = formData.get('subcategory') as string;
      const categorySpecificDataStr = formData.get('categorySpecificData') as string;
      const dynamicFieldsStr = formData.get('dynamicFields') as string;
      
      // Kategori özel verilerini parse et
      categorySpecificData = {};
      if (categorySpecificDataStr) {
        try {
          categorySpecificData = JSON.parse(categorySpecificDataStr);
        } catch (e) {
          console.error('Kategori özel verileri parse edilemedi:', e);
        }
      } else if (dynamicFieldsStr) {
        try {
          categorySpecificData = JSON.parse(dynamicFieldsStr);
        } catch (e) {
          console.error('Dinamik alanlar parse edilemedi:', e);
        }
      }

      // Resimleri işle
      images = [];
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'listings');
      
      // Upload dizinini oluştur
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // Resimleri kaydet
      for (let i = 0; ; i++) {
        const imageFile = formData.get(`image-${i}`) as File;
        if (!imageFile) break;

        const bytes = await imageFile.arrayBuffer();
         const buffer = Buffer.from(bytes);
      
         // Dosya adını oluştur
         const fileName = `${Date.now()}-${i}-${imageFile.name.split('.').pop()}`;
         const filePath = join(uploadDir, fileName);
         
         // Dosyayı kaydet
         await writeFile(filePath, buffer);
         images.push(`/uploads/listings/${fileName}`);
       }
     }

    // 6 haneli ilan numarası oluştur
    const listingNumber = await generateListingNumber();
    
    // 1 ay sonrası için expiresAt tarihi
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    // Yeni ilan oluştur
    const newListing = await prisma.listing.create({
      data: {
        listingNumber,
        title,
        description,
        minPrice,
        maxPrice,
        location: `${city}, ${district}`,
        categoryId: category,
        subCategoryId: subcategory,
        categorySpecificData: JSON.stringify(categorySpecificData),
        images: JSON.stringify(images),
        expiresAt,
        userId: user.id,
        status: 'active'
      },
      select: {
        id: true,
        title: true,
        description: true,
        minPrice: true,
        maxPrice: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true
          }
        }
      }
    });

    return NextResponse.json(newListing, { status: 201 });
  } catch (error) {
    console.error('İlan oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'İlan oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const categoryId = searchParams.get('categoryId');
    const subCategoryId = searchParams.get('subCategoryId');
    const search = searchParams.get('search');

    // Where koşullarını oluştur
    const whereConditions: any = {
      status: 'active'
    };

    if (categoryId) {
      whereConditions.categoryId = categoryId;
    }

    if (subCategoryId) {
      whereConditions.subCategoryId = subCategoryId;
    }

    if (search) {
      whereConditions.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    const listings = await prisma.listing.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            offers: true,
            favorites: true,
            questions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit ? parseInt(limit) : undefined
    });

    return NextResponse.json({
      success: true,
      listings: listings
    });
  } catch (error) {
    console.error('İlanları getirme hatası:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'İlanlar getirilirken bir hata oluştu' 
      },
      { status: 500 }
    );
  }
}