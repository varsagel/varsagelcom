import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from './lib/auth'
import { rateLimit } from './lib/rate-limit'
import { logSecurityEvent } from './lib/security-logger'

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']

async function validateCSRF(request: NextRequest): Promise<boolean> {
  const method = request.method
  
  // Güvenli HTTP metodları için CSRF kontrolü yapma
  if (SAFE_METHODS.includes(method)) {
    return true
  }

  const token = request.headers.get('x-csrf-token') || 
                request.headers.get('X-CSRF-Token') ||
                request.nextUrl.searchParams.get('csrf_token')

  if (!token) {
    return false
  }

  // Cache key for potential future use
  // const cacheKey = `csrf_${token}`
  
  try {
    // Basit token validasyonu (gerçek uygulamada daha güvenli olmalı)
    return token.length > 10 && /^[a-zA-Z0-9]+$/.test(token)
  } catch (error) {
    console.error('CSRF validation error:', error)
    return false
  }
}

// Token cache için Map
const tokenCache = new Map<string, { userId: string; expiry: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

// Cache temizleme fonksiyonu
function cleanExpiredTokens() {
  const now = Date.now();
  for (const [token, data] of tokenCache.entries()) {
    if (data.expiry < now) {
      tokenCache.delete(token);
    }
  }
}

// Korunacak rotalar
const protectedRoutes = [
  '/api/listings/create',
  '/api/offers',
  '/api/favorites',
  '/api/profile',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Sadece korumalı API rotalarını kontrol et
  if (pathname.startsWith('/api/')) {
    // Korumalı API rotası kontrolü
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
      try {
        // Authorization header'ı kontrol et
        const token = request.headers.get('Authorization')?.split(' ')[1];
        
        if (!token) {
          return NextResponse.json(
            { error: 'Authentication token is required' },
            { status: 401 }
          );
        }

        // Cache'den kontrol et
        const cachedData = tokenCache.get(token);
        let userId: string;
        
        if (cachedData && cachedData.expiry > Date.now()) {
          // Cache'den kullan
          userId = cachedData.userId;
        } else {
          // Token'ı doğrula ve cache'e ekle
          const payload = await verifyAuth(token);
          userId = payload.userId;
          
          // Cache'e ekle
          tokenCache.set(token, {
            userId: userId,
            expiry: Date.now() + CACHE_DURATION
          });
          
          // Periyodik olarak expired token'ları temizle
          if (Math.random() < 0.1) { // %10 ihtimalle
            cleanExpiredTokens();
          }
        }
        
        // Kullanıcı bilgisini request'e ekle
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', userId);
        
        // Yeni headers ile request'i devam ettir
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      } catch (err) {
        // Token verification failed
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match only API routes
     */
    '/api/:path*',
  ],
}