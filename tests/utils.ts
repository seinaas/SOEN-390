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
