import { createTRPCRouter, publicProcedure } from '../../../lib/trpc';
import { prisma } from '../../../lib/prisma';

export const databaseRouter = createTRPCRouter({
  healthCheck: publicProcedure
    .query(async () => {
      const startTime = Date.now();
      
      try {
        // Test database connection with simple count
        const userCount = await prisma.user.count();
        
        const responseTime = Date.now() - startTime;
        
        // Get additional metrics if basic connection works
        const listingCount = await prisma.listing.count();
        
        return {
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
        };
      } catch (error) {
        const responseTime = Date.now() - startTime;
        
        return {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime}ms`,
          database: {
            connected: false,
            responseTime,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        };
      }
    }),

  connectionStatus: publicProcedure
    .query(async () => {
      try {
        // Test basic connection
        await prisma.$connect();
        
        // Get connection pool info (if available)
        const result = await prisma.$queryRaw`
          SELECT 
            count(*) as active_connections
          FROM pg_stat_activity 
          WHERE state = 'active'
        ` as any[];
        
        return {
          connected: true,
          activeConnections: result[0]?.active_connections || 0,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        return {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        };
      }
    }),

  performanceMetrics: publicProcedure
    .query(async () => {
      const startTime = Date.now();
      
      try {
        // Test query performance
        const queries = [
          { name: 'user_count', query: prisma.user.count() },
          { name: 'listing_count', query: prisma.listing.count() },
          { name: 'recent_users', query: prisma.user.findMany({ take: 1, orderBy: { createdAt: 'desc' } }) },
          { name: 'recent_listings', query: prisma.listing.findMany({ take: 1, orderBy: { createdAt: 'desc' } }) }
        ];
        
        const results = [];
        
        for (const { name, query } of queries) {
          const queryStart = Date.now();
          try {
            await query;
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
        
        return {
          status: 'completed',
          totalResponseTime: totalTime,
          queries: results,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        return {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        };
      }
    })
});