import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Test database connection with simple count
    const userCount = await prisma.user.count();
    const responseTime = Date.now() - startTime;
    
    // Get additional metrics if basic connection works
    const listingCount = await prisma.listing.count();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      database: {
        connected: true,
        responseTime,
        metrics: {
          users: userCount,
          listings: listingCount
        }
      }
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      database: {
        connected: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Test database connection and performance
    const queries = [
      { name: 'user_count', query: () => prisma.user.count() },
      { name: 'listing_count', query: () => prisma.listing.count() },
      { name: 'recent_users', query: () => prisma.user.findMany({ take: 1, orderBy: { createdAt: 'desc' } }) },
      { name: 'recent_listings', query: () => prisma.listing.findMany({ take: 1, orderBy: { createdAt: 'desc' } }) }
    ];
    
    const results = [];
    
    for (const { name, query } of queries) {
      const queryStart = Date.now();
      try {
        await query();
        const queryTime = Date.now() - queryStart;
        results.push({ name, status: 'success', responseTime: queryTime });
      } catch (error) {
        const queryTime = Date.now() - queryStart;
        results.push({ 
          name, 
          status: 'error', 
          responseTime: queryTime,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    const totalTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'completed',
      totalResponseTime: totalTime,
      queries: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}