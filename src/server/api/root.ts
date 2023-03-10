import { createTRPCRouter } from './trpc';
import { exampleRouter } from './routers/example';
import { authRouter } from './routers/auth';
import { userRouter } from './routers/user';
import { connectionsRouter } from './routers/connections';
import { chatRouter } from './routers/chat';
import { conversationsRouter } from './routers/conversations';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  auth: authRouter,
  user: userRouter,
  connections: connectionsRouter,
  chat: chatRouter,
  conversation: conversationsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
