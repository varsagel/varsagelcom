import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Database query result:', result);
    
    // Test user count
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        queryResult: result,
        userCount
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}