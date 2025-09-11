import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// İlan oluşturma API endpoint'i
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Form verilerini al
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const location = formData.get('location') as string;
    const categoryId = formData.get('categoryId') as string;
    const subCategoryId = formData.get('subCategoryId') as string;
    const categorySpecificData = JSON.parse(formData.get('categorySpecificData') as string || '{}');
    
    // Fotoğrafları işle
    const images = formData.getAll('images') as File[];
    const imageUrls: string[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (image && image.size > 0) {
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Dosya adını oluştur
        const timestamp = Date.now();
        const fileName = `${timestamp}-${i}-${image.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        const imagePath = join(process.cwd(), 'public', 'uploads', fileName);
        
        // Dosyayı kaydet
        await writeFile(imagePath, buffer);
        imageUrls.push(`/uploads/${fileName}`);
      }
    }
    
    // Veritabanına kaydet
    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price,
        location,
        categoryId,
        subCategoryId,
        categorySpecificData,
        images: imageUrls,
        userId: 1, // TODO: Gerçek kullanıcı ID'si kullan
        status: 'active'
      }
    });
    
    return NextResponse.json({
      success: true,
      listing,
      message: 'İlan başarıyla oluşturuldu'
    }, { status: 201 });
    
  } catch (error) {
    console.error('İlan oluşturma hatası:', error);
    return NextResponse.json({
      success: false,
      message: 'İlan oluşturulurken bir hata oluştu'
    }, { status: 500 });
  }
}

// İlanları listeleme API endpoint'i
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const subCategoryId = searchParams.get('subCategoryId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    
    const skip = (page - 1) * limit;
    
    // Filtreleme koşulları
    const where: any = {
      status: 'active'
    };
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (subCategoryId) {
      where.subCategoryId = subCategoryId;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // İlanları getir
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              // Diğer kullanıcı bilgileri
            }
          }
        }
      }),
      prisma.listing.count({ where })
    ]);
    
    return NextResponse.json({
      success: true,
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('İlanları getirme hatası:', error);
    return NextResponse.json({
      success: false,
      message: 'İlanlar getirilirken bir hata oluştu'
    }, { status: 500 });
  }
}