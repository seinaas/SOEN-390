/*
*		Primary Router
*
*
*		This file exports the appRouter variable, which is the primary router for a server. The router includes several other routers such as authRouter, 
*		userRouter, connectionsRouter, chatRouter, postRouter, and notificationsRouter. These routers can be found in the /api/routers directory. The code 
*		also exports the type definition AppRouter for the API.
*/
import { createTRPCRouter, publicProcedure } from './trpc';
import { authRouter } from './routers/auth';
import { userRouter } from './routers/user';
import { connectionsRouter } from './routers/connections';
import { chatRouter } from './routers/chat';
import { postRouter } from './routers/post';
import { notificationsRouter } from './routers/notifications';
import { conversationsRouter } from './routers/conversations';
import { cloudFlareRouter } from './routers/cloudFlare';
import { jobPostingRouter } from './routers/postings';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  connections: connectionsRouter,
  chat: chatRouter,
  post: postRouter,
  notifications: notificationsRouter,
  conversation: conversationsRouter,
  cloudFlare: cloudFlareRouter,
  jobPosting: jobPostingRouter,
  search: publicProcedure.input(z.object({ query: z.string() })).query(async ({ ctx, input }) => {
    if (input.query.length < 3) {
      return null;
    }
    // Split query into array of words
    const searchArray = input.query
      .toLowerCase()
      .trim()
      .split(' ')
      .map((s) => `%${s}%`);

    // Raw query to search for users
    const users = await ctx.prisma.$queryRaw`
      SELECT firstName, lastName, email, image, headline
      FROM User
      WHERE lower(concat(firstName, lastName))
      LIKE ${Prisma.join(searchArray, ' AND lower(concat(firstName, lastName)) LIKE ')}
      OR lower(headline)
      LIKE ${Prisma.join(searchArray, ' AND lower(headline) LIKE ')}
      LIMIT 5
    `;

    const jobs = await ctx.prisma.$queryRaw`
      SELECT jobPostingId, jobTitle, company, location
      FROM JobPosting
      WHERE lower(concat(jobTitle, company, jobType, workplaceType))
      LIKE ${Prisma.join(searchArray, ' AND lower(concat(jobTitle, company, jobType, workplaceType)) LIKE ')}
      LIMIT 5
    `;

    // Need to cast type because of raw query
    type User = {
      firstName: string;
      lastName: string;
      email: string;
      image: string;
      headline: string;
    };

    type Job = {
      jobPostingId: string;
      jobTitle: string;
      company: string;
      location: string;
    };

    return {
      users: users as User[],
      jobs: jobs as Job[],
    };
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
