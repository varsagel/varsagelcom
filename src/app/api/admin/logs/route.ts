import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAILS = ['admin@varsagel.com'];

// Log seviyesi enum
enum LogLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success'
}

// Log kaydı oluşturma fonksiyonu
async function createLog({
  level,
  message,
  details,
  userId,
  action,
  resource,
  resourceId,
  ipAddress,
  userAgent
}: {
  level: LogLevel;
  message: string;
  details?: string;
  userId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    // Basit bir log sistemi için JSON dosyası kullanacağız
    // Gerçek uygulamada veritabanı veya log servisi kullanılabilir
    const logEntry = {
      id: crypto.randomUUID(),
      level,
      message,
      details,
      userId,
      action,
      resource,
      resourceId,
      ipAddress,
      userAgent,
      createdAt: new Date().toISOString()
    };

    // Log'u konsola yazdır (geliştirme için)
    console.log(`[${level.toUpperCase()}] ${action}: ${message}`, logEntry);
    
    return logEntry;
  } catch (error) {
    console.error('Log oluşturma hatası:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request.headers);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });
    
    if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const level = searchParams.get('level') || 'all';
    const action = searchParams.get('action') || 'all';
    const range = searchParams.get('range') || '24h';
    const isExport = searchParams.get('export') === 'true';
    const limit = 50;
    const offset = (page - 1) * limit;

    // Tarih aralığını hesapla
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Örnek log verileri (gerçek uygulamada veritabanından gelecek)
    const sampleLogs = [
      {
        id: '1',
        level: 'info' as const,
        message: 'Kullanıcı sisteme giriş yaptı',
        details: 'Başarılı giriş işlemi',
        userId: 'user1',
        userEmail: 'user@example.com',
        userName: 'Test Kullanıcı',
        action: 'LOGIN',
        resource: 'user',
        resourceId: 'user1',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        level: 'success' as const,
        message: 'Yeni ilan oluşturuldu',
        details: 'İlan başarıyla veritabanına kaydedildi',
        userId: 'user2',
        userEmail: 'seller@example.com',
        userName: 'Satıcı Kullanıcı',
        action: 'CREATE',
        resource: 'listing',
        resourceId: 'listing123',
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        level: 'warning' as const,
        message: 'Şüpheli giriş denemesi',
        details: 'Çok sayıda başarısız giriş denemesi tespit edildi',
        userId: undefined,
        userEmail: undefined,
        userName: undefined,
        action: 'LOGIN',
        resource: 'security',
        resourceId: undefined,
        ipAddress: '192.168.1.100',
        userAgent: 'curl/7.68.0',
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        level: 'error' as const,
        message: 'Veritabanı bağlantı hatası',
        details: 'PostgreSQL bağlantısı kesildi: connection timeout',
        userId: undefined,
        userEmail: undefined,
        userName: undefined,
        action: 'DATABASE',
        resource: 'system',
        resourceId: undefined,
        ipAddress: undefined,
        userAgent: undefined,
        createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '5',
        level: 'info' as const,
        message: 'İlan güncellendi',
        details: 'İlan fiyatı ve açıklaması güncellendi',
        userId: 'user2',
        userEmail: 'seller@example.com',
        userName: 'Satıcı Kullanıcı',
        action: 'UPDATE',
        resource: 'listing',
        resourceId: 'listing123',
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '6',
        level: 'success' as const,
        message: 'Teklif kabul edildi',
        details: 'Kullanıcı teklifini kabul etti ve satış tamamlandı',
        userId: 'user3',
        userEmail: 'buyer@example.com',
        userName: 'Alıcı Kullanıcı',
        action: 'UPDATE',
        resource: 'offer',
        resourceId: 'offer456',
        ipAddress: '192.168.1.3',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
        createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '7',
        level: 'warning' as const,
        message: 'Yasaklı kelime tespit edildi',
        details: 'İlan açıklamasında yasaklı kelime bulundu ve otomatik olarak filtrelendi',
        userId: 'user4',
        userEmail: 'user4@example.com',
        userName: 'Kullanıcı 4',
        action: 'CREATE',
        resource: 'listing',
        resourceId: 'listing789',
        ipAddress: '192.168.1.4',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        createdAt: new Date(now.getTime() - 14 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '8',
        level: 'error' as const,
        message: 'Dosya yükleme hatası',
        details: 'İlan resmi yüklenirken hata oluştu: file size too large',
        userId: 'user5',
        userEmail: 'user5@example.com',
        userName: 'Kullanıcı 5',
        action: 'CREATE',
        resource: 'listing',
        resourceId: undefined,
        ipAddress: '192.168.1.5',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(now.getTime() - 16 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Filtreleme
    let filteredLogs = sampleLogs.filter(log => {
      const logDate = new Date(log.createdAt);
      if (logDate < startDate) return false;
      
      if (search && !log.message.toLowerCase().includes(search.toLowerCase()) && 
          !log.details?.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      
      if (level !== 'all' && log.level !== level) return false;
      if (action !== 'all' && log.action !== action) return false;
      
      return true;
    });

    // Export için CSV formatı
    if (isExport) {
      const csvHeaders = 'ID,Seviye,Aksiyon,Mesaj,Detaylar,Kullanıcı,Email,IP Adresi,Tarih\n';
      const csvRows = filteredLogs.map(log => 
        `"${log.id}","${log.level}","${log.action}","${log.message}","${log.details || ''}","${log.userName || ''}","${log.userEmail || ''}","${log.ipAddress || ''}","${log.createdAt}"`
      ).join('\n');
      
      const csvContent = csvHeaders + csvRows;
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="logs-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    // Sayfalama
    const totalCount = filteredLogs.length;
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      logs: paginatedLogs,
      totalPages,
      currentPage: page,
      totalCount
    });

  } catch (error) {
    console.error('Loglar API hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    const userId = await getUserIdFromToken(token);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });
    
    if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }

    // Tüm logları sil (gerçek uygulamada log dosyası veya veritabanı temizlenir)
    console.log('Tüm loglar temizlendi');

    return NextResponse.json({
      success: true,
      message: 'Tüm loglar başarıyla silindi'
    });

  } catch (error) {
    console.error('Log silme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}