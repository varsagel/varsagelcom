import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserId } from '@/lib/auth';
import { checkBannedWords } from '../../banned-words/route';
import { sanitizeInput, validateUrl } from '@/lib/sanitize';

const prisma = new PrismaClient();

// Benzersiz görüntüleme numarası oluştur
async function generateDisplayNumber(): Promise<string> {
  let displayNumber: string;
  let isUnique = false;
  
  while (!isUnique) {
    // 6 haneli rastgele sayı oluştur
    displayNumber = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Bu numaranın daha önce kullanılıp kullanılmadığını kontrol et
    const existing = await prisma.listing.findUnique({
      where: { displayNumber }
    });
    
    if (!existing) {
      isUnique = true;
    }
  }
  
  return displayNumber!;
}

export async function POST(request: NextRequest) {
  try {
    // Kullanıcı ID'sini al
    const userId = getUserId(request.headers);
    
    // Request body'den verileri al ve sanitize et
    const body = await request.json();
    const sanitizedBody = sanitizeInput(body);
    const { 
      title, 
      description, 
      category, 
      subcategory,
      location, 
      district,
      priceMin, 
      priceMax, 
      images, 
      videoUrl,
      categorySpecificData,
      mileageMin,
      mileageMax,
      icon
    } = sanitizedBody;
    
    // Zorunlu alanları kontrol et
    if (!title || !description || !category || !location || !priceMin || !priceMax) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Video URL'ini validate et
    if (videoUrl && !validateUrl(videoUrl)) {
      return NextResponse.json(
        { error: 'Invalid video URL format' },
        { status: 400 }
      );
    }
    
    // Fiyat aralığını validate et
    const minPrice = parseFloat(priceMin);
    const maxPrice = parseFloat(priceMax);
    
    if (isNaN(minPrice) || isNaN(maxPrice) || minPrice < 0 || maxPrice < 0 || minPrice > maxPrice) {
      return NextResponse.json(
        { error: 'Invalid price range' },
        { status: 400 }
      );
    }
    
    // Icon sadece vasıta otomobil kategorisinde zorunlu - şimdilik devre dışı
    // if (category === 'vasita' && subcategory === 'Otomobil' && !icon) {
    //   return NextResponse.json(
    //     { error: 'Icon selection is required for vehicle automobile category' },
    //     { status: 400 }
    //   );
    // }
    
    // Yasaklı kelime kontrolü - başlık
    const titleCheck = checkBannedWords(title);
    if (titleCheck.hasBannedWords) {
      return NextResponse.json({
        error: 'İlan başlığında uygunsuz içerik bulunmaktadır. Lütfen başlığınızı düzenleyerek tekrar deneyin.',
        bannedWords: titleCheck.bannedWords
      }, { status: 400 });
    }
    
    // Yasaklı kelime kontrolü - açıklama
    const descriptionCheck = checkBannedWords(description);
    if (descriptionCheck.hasBannedWords) {
      return NextResponse.json({
        error: 'İlan açıklamasında uygunsuz içerik bulunmaktadır. Lütfen açıklamanızı düzenleyerek tekrar deneyin.',
        bannedWords: descriptionCheck.bannedWords
      }, { status: 400 });
    }
    
    // Benzersiz görüntüleme numarası oluştur
    const displayNumber = await generateDisplayNumber();
    
    // İlanı oluştur
    const listing = await prisma.listing.create({
      data: {
        displayNumber,
        title,
        description,
        category,
        subcategory: subcategory || null,
        location,
        district: district || null,
        budgetMin: parseFloat(priceMin),
        budgetMax: parseFloat(priceMax),
        images: JSON.stringify(images || []),
        videoUrl,
        categorySpecificData: categorySpecificData ? JSON.stringify(categorySpecificData) : undefined,
        mileageMin: mileageMin ? parseInt(mileageMin) : null,
        mileageMax: mileageMax ? parseInt(mileageMax) : null,
        icon: icon || null,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün sonra
        userId,
      },
    });
    
    return NextResponse.json(
      { message: 'Listing created successfully', listing },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the listing' },
      { status: 500 }
    );
  }
}