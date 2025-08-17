import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserIdFromToken } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// Admin yetkilerini kontrol eden email listesi
const ADMIN_EMAILS = [
  'admin@varsagel.com',
];

// Ayarlar dosyasının yolu
const SETTINGS_FILE_PATH = path.join(process.cwd(), 'admin-settings.json');

// Varsayılan ayarlar
const DEFAULT_SETTINGS = {
  siteName: 'Varsagel',
  siteDescription: 'Güvenli alışveriş platformu',
  contactEmail: 'info@varsagel.com',
  supportEmail: 'support@varsagel.com',
  maxListingImages: 10,
  listingExpiryDays: 30,
  featuredListingDays: 7,
  minListingPrice: 1,
  maxListingPrice: 1000000,
  commissionRate: 5,
  autoApproveListings: false,
  requireEmailVerification: true,
  allowGuestViewing: true,
  maintenanceMode: false,
  bannedWords: [
    'spam',
    'sahte',
    'dolandırıcı',
    'illegal',
    'yasadışı'
  ]
};

export async function GET(request: NextRequest) {
  try {
    // Token'dan kullanıcı ID'sini al
    const userId = await getUserIdFromToken(request.headers);
    
    // Kullanıcıyı veritabanından getir ve admin yetkisi kontrol et
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json(
        { error: 'Admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    let settings;
    
    try {
      // Ayarlar dosyasını oku
      const settingsData = await fs.readFile(SETTINGS_FILE_PATH, 'utf-8');
      settings = JSON.parse(settingsData);
    } catch (error) {
      // Dosya yoksa varsayılan ayarları kullan
      settings = DEFAULT_SETTINGS;
      
      // Varsayılan ayarları dosyaya kaydet
      await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2));
    }

    // Yasaklı kelimeleri veritabanından da al
    const bannedWordsFromDB = await prisma.$queryRaw`
      SELECT word FROM banned_words
    ` as { word: string }[];
    
    const dbBannedWords = bannedWordsFromDB.map(item => item.word);
    
    // Dosyadaki ve veritabanındaki yasaklı kelimeleri birleştir
    const allBannedWords = [...new Set([...settings.bannedWords, ...dbBannedWords])];
    
    settings.bannedWords = allBannedWords;

    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Admin settings get error:', error);
    return NextResponse.json(
      { error: 'Ayarlar alınırken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Token'dan kullanıcı ID'sini al
    const userId = await getUserIdFromToken(request.headers);
    
    // Kullanıcıyı veritabanından getir ve admin yetkisi kontrol et
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json(
        { error: 'Admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const newSettings = await request.json();
    
    // Ayarları doğrula
    const validatedSettings = {
      siteName: String(newSettings.siteName || DEFAULT_SETTINGS.siteName),
      siteDescription: String(newSettings.siteDescription || DEFAULT_SETTINGS.siteDescription),
      contactEmail: String(newSettings.contactEmail || DEFAULT_SETTINGS.contactEmail),
      supportEmail: String(newSettings.supportEmail || DEFAULT_SETTINGS.supportEmail),
      maxListingImages: Math.max(1, Math.min(20, parseInt(newSettings.maxListingImages) || DEFAULT_SETTINGS.maxListingImages)),
      listingExpiryDays: Math.max(1, Math.min(365, parseInt(newSettings.listingExpiryDays) || DEFAULT_SETTINGS.listingExpiryDays)),
      featuredListingDays: Math.max(1, Math.min(30, parseInt(newSettings.featuredListingDays) || DEFAULT_SETTINGS.featuredListingDays)),
      minListingPrice: Math.max(0, parseInt(newSettings.minListingPrice) || DEFAULT_SETTINGS.minListingPrice),
      maxListingPrice: Math.max(1, parseInt(newSettings.maxListingPrice) || DEFAULT_SETTINGS.maxListingPrice),
      commissionRate: Math.max(0, Math.min(100, parseFloat(newSettings.commissionRate) || DEFAULT_SETTINGS.commissionRate)),
      autoApproveListings: Boolean(newSettings.autoApproveListings),
      requireEmailVerification: Boolean(newSettings.requireEmailVerification),
      allowGuestViewing: Boolean(newSettings.allowGuestViewing),
      maintenanceMode: Boolean(newSettings.maintenanceMode),
      bannedWords: Array.isArray(newSettings.bannedWords) ? newSettings.bannedWords : DEFAULT_SETTINGS.bannedWords
    };

    // Ayarları dosyaya kaydet
    await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(validatedSettings, null, 2));
    
    // Yasaklı kelimeleri veritabanına kaydet
    await prisma.$transaction(async (tx) => {
      // Önce mevcut yasaklı kelimeleri sil
      await tx.$executeRaw`DELETE FROM banned_words`;
      
      // Yeni yasaklı kelimeleri ekle
      for (const word of validatedSettings.bannedWords) {
        await tx.$executeRaw`
          INSERT INTO banned_words (word) VALUES (${word})
          ON CONFLICT (word) DO NOTHING
        `;
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Ayarlar başarıyla kaydedildi',
      settings: validatedSettings
    });
  } catch (error) {
    console.error('Admin settings save error:', error);
    return NextResponse.json(
      { error: 'Ayarlar kaydedilirken hata oluştu' },
      { status: 500 }
    );
  }
}