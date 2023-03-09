import { User } from '@prisma/client';
import { type Session } from 'next-auth';
import { appRouter } from '../src/server/api/root';
import { createMockTRPCContext } from '../src/server/api/trpc';

/** A convenience method to call tRPC queries */
export const trpcRequest = (session?: Session) => {
  const ctx = createMockTRPCContext({ session: session as Session });
  return {
    ctx,
    caller: appRouter.createCaller(ctx),
  };
};

export const createUser = (user: Partial<User> = {}) => {
  return {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@doe.com',
    headline: '',
    education: '',
    jobs: '',
    bio: '',
    volunteering: '',
    skills: '',
    recommendations: '',
    courses: '',
    projects: '',
    awards: '',
    languages: '',
    emailVerified: new Date(),
    phone: '',
    image: '',
    password: '',
    ...user,
  };
};
