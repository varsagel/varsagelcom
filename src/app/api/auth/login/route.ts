import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose';
import { sanitizeInput, validateEmail } from '@/lib/sanitize';

// Rate limiting için basit in-memory store
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);
  
  if (!attempts) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  
  // 15 dakika içinde 5'ten fazla deneme varsa engelle
  if (attempts.count >= 5 && now - attempts.lastAttempt < 15 * 60 * 1000) {
    return false;
  }
  
  // 15 dakika geçtiyse sıfırla
  if (now - attempts.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Deneme sayısını artır
  attempts.count++;
  attempts.lastAttempt = now;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting kontrolü
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    const sanitizedBody = sanitizeInput(body);
    const { email, password } = sanitizedBody;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Email formatını kontrol et
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Password uzunluğunu kontrol et
    if (password.length < 6 || password.length > 128) {
      return NextResponse.json(
        { error: 'Invalid password length' },
        { status: 400 }
      );
    }

    // Find user
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('*')
      .eq('email', email)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('Supabase error:', userError);
      return NextResponse.json(
        { error: 'An error occurred during login' },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
    const token = await new SignJWT({ userId: user.id, email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        message: 'Login successful', 
        user: userWithoutPassword,
        token 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}