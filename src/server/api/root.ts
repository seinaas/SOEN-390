import { createTRPCRouter } from './trpc';
import { authRouter } from './routers/auth';
import { userRouter } from './routers/user';
import { connectionsRouter } from './routers/connections';
import { chatRouter } from './routers/chat';
import { postRouter } from './routers/post';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  connections: connectionsRouter,
  chat: chatRouter,
  post: postRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
