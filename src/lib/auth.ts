import { jwtVerify } from 'jose';

interface JwtPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * JWT token'ı doğrular ve payload'ı döndürür (middleware için)
 */
export async function verifyAuth(token: string): Promise<JwtPayload> {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    console.log('JWT_SECRET in verifyAuth:', secret ? 'SET' : 'NOT SET');
    console.log('Token being verified:', token.substring(0, 50) + '...');
    
    // Token'ı doğrula
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    console.log('Token verified successfully:', payload.userId);
    return payload as JwtPayload;
  } catch (error) {
    console.log('Token verification error details:', error);
    throw new Error('Invalid token');
  }
}

/**
 * Request header'dan kullanıcı ID'sini alır
 */
export function getUserId(headers: Headers): string {
  const userId = headers.get('x-user-id');
  
  if (!userId) {
    throw new Error('User ID not found in request');
  }
  
  return userId;
}

/**
 * Authorization header'dan token'ı alır ve user ID'yi döndürür
 */
export async function getUserIdFromToken(headersOrToken: Headers | string): Promise<string> {
  let token: string;
  
  if (typeof headersOrToken === 'string') {
    // Direkt token geçilmiş
    token = headersOrToken;
  } else {
    // Headers objesi geçilmiş
    const authHeader = headersOrToken.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Authorization header not found or invalid');
    }
    
    token = authHeader.substring(7); // "Bearer " kısmını çıkar
  }
  
  try {
    const payload = await verifyAuth(token);
    return payload.userId;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}