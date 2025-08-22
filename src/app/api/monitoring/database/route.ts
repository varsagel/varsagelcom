import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  try {
    // Database configuration check
    const databaseUrl = process.env.DATABASE_URL;
    const directUrl = process.env.DIRECT_URL;
    
    const monitoring = {
      timestamp,
      configuration: {
        database_url_configured: !!databaseUrl,
        direct_url_configured: !!directUrl,
        database_provider: databaseUrl?.includes('supabase') ? 'supabase' : 
                          databaseUrl?.includes('postgres') ? 'postgresql' : 'unknown'
      },
      environment: {
        node_env: process.env.NODE_ENV,
        vercel_env: process.env.VERCEL_ENV,
        vercel_region: process.env.VERCEL_REGION
      },
      prisma: {
        version: process.env.npm_package_dependencies_prisma_client || 'unknown',
        engine_type: process.env.PRISMA_CLIENT_ENGINE_TYPE || 'binary',
        query_engine_type: process.env.PRISMA_CLI_QUERY_ENGINE_TYPE || 'binary'
      },
      performance: {
        response_time: Date.now() - startTime,
        memory_usage: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
          heap_used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          heap_total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        },
        uptime: process.uptime()
      }
    };
    
    return NextResponse.json(monitoring);
  } catch (error) {
    return NextResponse.json({
      error: 'Monitoring data collection failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { test_type = 'basic' } = body;
    
    const tests = {
      timestamp: new Date().toISOString(),
      test_type,
      results: {
        environment_variables: {
          database_url: !!process.env.DATABASE_URL,
          direct_url: !!process.env.DIRECT_URL,
          jwt_secret: !!process.env.JWT_SECRET,
          nextauth_secret: !!process.env.NEXTAUTH_SECRET
        },
        system: {
          node_version: process.version,
          platform: process.platform,
          arch: process.arch,
          memory_total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          uptime: process.uptime()
        }
      },
      performance: {
        response_time: Date.now() - startTime
      }
    };
    
    return NextResponse.json(tests);
  } catch (error) {
    return NextResponse.json({
      error: 'Database test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}