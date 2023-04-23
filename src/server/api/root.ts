import { createTRPCRouter } from './trpc';
import { authRouter } from './routers/auth';
import { userRouter } from './routers/user';
import { connectionsRouter } from './routers/connections';
import { chatRouter } from './routers/chat';
import { notificationsRouter } from './routers/notifications';
import { conversationsRouter } from './routers/conversations';
import { cloudFlareRouter } from './routers/cloudFlare';
import { jobPostingRouter } from './routers/postings';
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
  conversation: conversationsRouter,
  post: postRouter,
  notifications: notificationsRouter,
  cloudFlare: cloudFlareRouter,
  jobPosting: jobPostingRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
