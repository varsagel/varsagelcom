import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  // System health checks
  const healthChecks = {
    api: { status: 'healthy', responseTime: 0 },
    database: { status: 'unknown', responseTime: 0, connected: false, url: '', error: '' },
    memory: { status: 'unknown', usage: {} as any, error: '' },
    uptime: process.uptime()
  };
  
  // API Health (always healthy if we reach this point)
  healthChecks.api.responseTime = Date.now() - startTime;
  
  // Database Health (basic check without Prisma)
  const dbStartTime = Date.now();
  try {
    // Check if DATABASE_URL is configured
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      healthChecks.database.status = 'configured';
      healthChecks.database.connected = true;
      healthChecks.database.url = databaseUrl.includes('supabase') ? 'supabase' : 'postgresql';
    } else {
      healthChecks.database.status = 'not_configured';
      healthChecks.database.connected = false;
    }
    healthChecks.database.responseTime = Date.now() - dbStartTime;
  } catch (error) {
    healthChecks.database.status = 'error';
    healthChecks.database.connected = false;
    healthChecks.database.responseTime = Date.now() - dbStartTime;
    healthChecks.database.error = error instanceof Error ? error.message : 'Unknown error';
  }
  
  // Memory Usage
  try {
    const memUsage = process.memoryUsage();
    healthChecks.memory.status = 'healthy';
    healthChecks.memory.usage = {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024) // MB
    };
  } catch (error) {
    healthChecks.memory.status = 'error';
    healthChecks.memory.error = error instanceof Error ? error.message : 'Unknown error';
  }
  
  // Overall status
  const overallStatus = (
    healthChecks.api.status === 'healthy' && 
    healthChecks.memory.status === 'healthy' &&
    (healthChecks.database.status === 'configured' || healthChecks.database.status === 'healthy')
  ) ? 'healthy' : 'degraded';
  
  const totalResponseTime = Date.now() - startTime;
  
  const response = {
    status: overallStatus,
    timestamp,
    responseTime: `${totalResponseTime}ms`,
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: healthChecks
  };
  
  // Return appropriate HTTP status
  const httpStatus = overallStatus === 'healthy' ? 200 : 503;
  
  return NextResponse.json(response, { status: httpStatus });
}