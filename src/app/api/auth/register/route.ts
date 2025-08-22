import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcrypt';
import { createId } from '@paralleldrive/cuid2';

export async function POST(request: NextRequest) {
  try {
    console.log('Register endpoint called');
    console.log('Environment check:', {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
      hasJwtSecret: !!process.env.JWT_SECRET,
      nodeEnv: process.env.NODE_ENV
    });
    
    const body = await request.json();
    const { name, email, password } = body;
    console.log('Request body parsed:', { name, email, hasPassword: !!password });

    // Validate input
    if (!name || !email || !password) {
      console.log('Validation failed: missing required fields');
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    console.log('Checking if user exists with email:', email);
    const { data: existingUser, error: checkError } = await supabase
      .from('User')
      .select('*')
      .eq('email', email)
      .single();

    console.log('User check result:', { existingUser: !!existingUser, checkError });

    if (existingUser) {
      console.log('User already exists');
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    console.log('Hashing password');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Create user
    const userId = createId();
    const userData = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rating: 0,
      reviewCount: 0,
      isBanned: false,
    };
    console.log('Creating user with data:', { ...userData, password: '[HIDDEN]' });
    
    const { data: user, error } = await supabase
      .from('User')
      .insert(userData)
      .select()
      .single();
    
    console.log('User creation result:', { user: !!user, error });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: 'User registered successfully', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}