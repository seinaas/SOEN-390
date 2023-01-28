import { type Session } from 'next-auth';
import { appRouter } from '../src/server/api/root';
import { createInnerTRPCContext } from '../src/server/api/trpc';

/** A convenience method to call tRPC queries */
export const trpcRequest = (session?: Session) => {
  return appRouter.createCaller(createInnerTRPCContext({ session: session as Session }));
};
