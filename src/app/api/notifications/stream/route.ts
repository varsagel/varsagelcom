import { NextRequest } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Token'ı query parameter'dan al
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token gerekli' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Token'dan userId'yi al
    let userId;
    try {
      const authHeaders = new Headers();
      authHeaders.set('authorization', `Bearer ${token}`);
      userId = await getUserIdFromToken(authHeaders);
    } catch (error) {
      console.error('SSE token doğrulama hatası:', error);
      return new Response(
        JSON.stringify({ error: 'Geçersiz veya süresi dolmuş token' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // SSE headers
    const responseHeaders = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // ReadableStream oluştur
    const stream = new ReadableStream({
      start(controller) {
        // İlk bağlantı mesajı
        controller.enqueue(`data: ${JSON.stringify({ type: 'connected', message: 'SSE bağlantısı kuruldu' })}\n\n`);
        
        // Periyodik bildirim kontrolü
        const checkNotifications = async () => {
          try {
            // Son 1 dakikadaki yeni bildirimleri kontrol et
            const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
            
            const newNotifications = await prisma.notification.findMany({
              where: {
                userId: userId,
                createdAt: {
                  gte: oneMinuteAgo
                },
                type: {
                  not: 'new_message'
                }
              },
              orderBy: {
                createdAt: 'desc'
              },
              take: 10
            });
            
            if (newNotifications.length > 0) {
              // Yeni bildirimleri gönder
              controller.enqueue(`data: ${JSON.stringify({
                type: 'new_notifications',
                notifications: newNotifications,
                count: newNotifications.length
              })}\n\n`);
            }
            
            // Okunmamış bildirim sayısını gönder (mesaj bildirimleri hariç)
            const unreadCount = await prisma.notification.count({
              where: {
                userId: userId,
                isRead: false,
                type: {
                  not: 'new_message'
                }
              }
            });
            
            controller.enqueue(`data: ${JSON.stringify({
              type: 'unread_count',
              count: unreadCount
            })}\n\n`);
            
          } catch (error) {
            console.error('SSE bildirim kontrolü hatası:', error);
          }
        };
        
        // İlk kontrol
        checkNotifications();
        
        // Her 30 saniyede bir kontrol et
        const interval = setInterval(checkNotifications, 30000);
        
        // Bağlantı kapandığında temizlik
        request.signal.addEventListener('abort', () => {
          clearInterval(interval);
          controller.close();
        });
      }
    });

    return new Response(stream, { headers: responseHeaders });
    
  } catch (error) {
    console.error('SSE endpoint hatası:', error);
    return new Response(
      JSON.stringify({ error: 'SSE bağlantısı kurulamadı' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// OPTIONS method for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
}