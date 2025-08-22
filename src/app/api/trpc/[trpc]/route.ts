import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { type NextRequest, NextResponse } from 'next/server';

import { appRouter } from '../../../../server/api/root';
import { createTRPCContext } from '../../../../lib/trpc';

const handler = async (req: NextRequest) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ 
      req: req as any, 
      res: {} as any,
      info: { isBatchCall: false, calls: [] } as any
    }),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`,
              error
            );
          }
        : undefined,
  });
};

export { handler as GET, handler as POST };