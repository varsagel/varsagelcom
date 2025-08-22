import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? '[SET]' : '[NOT SET]',
      DIRECT_URL: process.env.DIRECT_URL ? '[SET]' : '[NOT SET]',
      SUPABASE_URL: process.env.SUPABASE_URL ? '[SET]' : '[NOT SET]',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? '[SET]' : '[NOT SET]',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '[SET]' : '[NOT SET]',
      JWT_SECRET: process.env.JWT_SECRET ? '[SET]' : '[NOT SET]',
    };

    return NextResponse.json({
      success: true,
      environment: envVars
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}