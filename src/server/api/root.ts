/*
 *		Primary Router
 *
 *
 *		This file exports the appRouter variable, which is the primary router for a server. The router includes several other routers such as authRouter,
 *		userRouter, connectionsRouter, chatRouter, postRouter, and notificationsRouter. These routers can be found in the /api/routers directory. The code
 *		also exports the type definition AppRouter for the API.
 */
import { createTRPCRouter } from './trpc';
import { authRouter } from './routers/auth';
import { userRouter } from './routers/user';
import { connectionsRouter } from './routers/connections';
import { chatRouter } from './routers/chat';
import { postRouter } from './routers/post';
import { notificationsRouter } from './routers/notifications';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  connections: connectionsRouter,
  chat: chatRouter,
  post: postRouter,
  notifications: notificationsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
