import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from './lib/auth';

// CSRF koruması için güvenli HTTP metodları
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

// CSRF token kontrolü
function validateCSRF(request: NextRequest): boolean {
  // Güvenli metodlar için CSRF kontrolü gerekmiyor
  if (SAFE_METHODS.includes(request.method)) {
    return true;
  }
  
  // Same-origin kontrolü
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  
  if (origin && host) {
    try {
      const originUrl = new URL(origin);
      return originUrl.host === host;
    } catch {
      return false;
    }
  }
  
  // Referer kontrolü (fallback)
  const referer = request.headers.get('referer');
  if (referer && host) {
    try {
      const refererUrl = new URL(referer);
      return refererUrl.host === host;
    } catch {
      return false;
    }
  }
  
  return false;
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

  // CSRF koruması kontrolü
  if (!validateCSRF(request)) {
    return NextResponse.json(
      { error: 'CSRF validation failed' },
      { status: 403 }
    );
  }

  // API rotası kontrolü
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
          console.log('Middleware - Using cached token for userId:', userId);
        } else {
          // Token'ı doğrula ve cache'e ekle
          console.log('Middleware - Verifying token:', token);
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
          
          // Token verified and cached
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
      } catch (error) {
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

// Middleware'in çalışacağı rotaları belirt
export const config = {
  matcher: [
    '/api/:path*',
  ],
};