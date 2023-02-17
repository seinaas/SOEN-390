import { createTRPCRouter } from './trpc';
import { exampleRouter } from './routers/example';
import { userRouter } from './routers/user';
import { connectionsRouter } from './routers/connections';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  user: userRouter,
  connections: connectionsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
